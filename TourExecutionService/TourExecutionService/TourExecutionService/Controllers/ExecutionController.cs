using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourExecutionService.DTO;
using TourExecutionService.Model;
using TourExecutionService.Repository;
using TourExecutionService.Service;

namespace TourExecutionService.Controllers
{
    [ApiController]
    [Route("api/execution")]
    public class ExecutionController : ControllerBase
    {
        private readonly ExecutionRepository _repo;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;
        private const double ProximityMeters = 100;

        public ExecutionController(ExecutionRepository repo, IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _repo = repo;
            _httpClientFactory = httpClientFactory;
            _config = config;
        }

        [Authorize]
        [HttpGet("position")]
        public async Task<IActionResult> GetPosition()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var pos = await _repo.GetPositionAsync(userId.Value);
            return Ok(pos ?? new TouristPosition { TouristId = userId.Value });
        }

        [Authorize]
        [HttpPut("position")]
        public async Task<IActionResult> SetPosition([FromBody] SetPositionRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var pos = await _repo.UpsertPositionAsync(userId.Value, request.Latitude, request.Longitude);
            return Ok(pos);
        }

        [Authorize]
        [HttpPost("start")]
        public async Task<IActionResult> Start([FromBody] StartExecutionRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var active = await _repo.GetActiveAsync(userId.Value);
            if (active != null)
                return BadRequest(new { message = "Vec imate aktivnu turu.", active });

            var purchased = await HasPurchasedAsync(userId.Value, request.TourId);
            if (!purchased)
                return BadRequest(new { message = "Morate kupiti turu pre pokretanja." });

            var position = await _repo.GetPositionAsync(userId.Value);
            if (position == null)
                return BadRequest(new { message = "Prvo postavite poziciju u simulatoru." });

            var execution = await _repo.CreateAsync(new TourExecution
            {
                TourId = request.TourId,
                TouristId = userId.Value,
                Status = ExecutionStatus.Active,
                StartedAt = DateTime.UtcNow,
                LastActivity = DateTime.UtcNow
            });
            return Ok(execution);
        }

        [Authorize]
        [HttpGet("active")]
        public async Task<IActionResult> Active()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _repo.GetActiveAsync(userId.Value));
        }

        [Authorize]
        [HttpPost("{id:int}/check")]
        public async Task<IActionResult> Check(int id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var execution = await _repo.GetByIdAsync(id);
            if (execution == null || execution.TouristId != userId.Value) return NotFound();
            if (execution.Status != ExecutionStatus.Active)
                return BadRequest(new { message = "Sesija nije aktivna." });

            var position = await _repo.GetPositionAsync(userId.Value);
            if (position == null)
                return BadRequest(new { message = "Pozicija nije postavljena." });

            var keyPoints = await GetKeyPointsAsync(execution.TourId);
            execution.LastActivity = DateTime.UtcNow;
            CompletedKeyPoint? newlyCompleted = null;

            foreach (var kp in keyPoints)
            {
                if (execution.CompletedKeyPoints.Any(c => c.KeyPointId == kp.Id)) continue;
                var distance = GeoHelper.DistanceMeters(position.Latitude, position.Longitude, kp.Latitude, kp.Longitude);
                if (distance <= ProximityMeters)
                {
                    newlyCompleted = new CompletedKeyPoint { KeyPointId = kp.Id, CompletedAt = DateTime.UtcNow };
                    execution.CompletedKeyPoints.Add(newlyCompleted);
                    break;
                }
            }

            await _repo.ReplaceAsync(execution);
            return Ok(new
            {
                execution,
                position,
                newlyCompleted,
                completedCount = execution.CompletedKeyPoints.Count,
                totalKeyPoints = keyPoints.Count
            });
        }

        [Authorize]
        [HttpPost("{id:int}/complete")]
        public async Task<IActionResult> Complete(int id) => await End(id, ExecutionStatus.Completed);

        [Authorize]
        [HttpPost("{id:int}/abandon")]
        public async Task<IActionResult> Abandon(int id) => await End(id, ExecutionStatus.Abandoned);

        private async Task<IActionResult> End(int id, ExecutionStatus status)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var execution = await _repo.GetByIdAsync(id);
            if (execution == null || execution.TouristId != userId.Value) return NotFound();
            if (execution.Status != ExecutionStatus.Active)
                return BadRequest(new { message = "Sesija nije aktivna." });

            execution.Status = status;
            execution.EndedAt = DateTime.UtcNow;
            execution.LastActivity = DateTime.UtcNow;
            await _repo.ReplaceAsync(execution);
            return Ok(execution);
        }

        private async Task<bool> HasPurchasedAsync(int touristId, int tourId)
        {
            var client = _httpClientFactory.CreateClient();
            var purchaseBase = _config["Services:Purchase"] ?? "http://localhost:5004";
            var msg = new HttpRequestMessage(HttpMethod.Get, $"{purchaseBase}/api/purchase/purchases/{tourId}/has");
            var auth = Request.Headers.Authorization.ToString();
            if (!string.IsNullOrEmpty(auth)) msg.Headers.TryAddWithoutValidation("Authorization", auth);
            var response = await client.SendAsync(msg);
            if (!response.IsSuccessStatusCode) return false;
            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            return doc.RootElement.TryGetProperty("purchased", out var p) && p.GetBoolean();
        }

        private async Task<List<KeyPointDto>> GetKeyPointsAsync(int tourId)
        {
            var client = _httpClientFactory.CreateClient();
            var tourBase = _config["Services:Tour"] ?? "http://localhost:5003";
            var msg = new HttpRequestMessage(HttpMethod.Get, $"{tourBase}/api/tours/{tourId}/keypoints");
            var auth = Request.Headers.Authorization.ToString();
            if (!string.IsNullOrEmpty(auth)) msg.Headers.TryAddWithoutValidation("Authorization", auth);
            var response = await client.SendAsync(msg);
            if (!response.IsSuccessStatusCode) return new List<KeyPointDto>();
            return await response.Content.ReadFromJsonAsync<List<KeyPointDto>>() ?? new List<KeyPointDto>();
        }

        private int? GetUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue("sub");
            return int.TryParse(value, out var id) ? id : null;
        }

        private class KeyPointDto
        {
            public int Id { get; set; }
            public double Latitude { get; set; }
            public double Longitude { get; set; }
            public string Name { get; set; } = string.Empty;
        }
    }
}
