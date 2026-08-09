using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourService.DTO;
using TourService.Model;
using TourService.Repository;
using TourService.Service;

namespace TourService.Controllers
{
    [ApiController]
    [Route("api/tours")]
    public class TourController : ControllerBase
    {
        private readonly TourRepository _repo;
        public TourController(TourRepository repo) => _repo = repo;

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTourRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            if (!User.IsInRole("Vodic") && !User.IsInRole("Administrator"))
                return Forbid();

            var tour = await _repo.CreateAsync(new Tour
            {
                AuthorId = userId.Value,
                Name = request.Name.Trim(),
                Description = request.Description.Trim(),
                Difficulty = request.Difficulty,
                Tags = request.Tags ?? new List<string>(),
                Status = TourStatus.Draft,
                Price = 0
            });
            return Ok(tour);
        }

        [Authorize]
        [HttpGet("mine")]
        public async Task<IActionResult> Mine()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _repo.GetByAuthorAsync(userId.Value));
        }

        [Authorize]
        [HttpGet("published")]
        public async Task<IActionResult> Published()
        {
            var tours = await _repo.GetPublishedAsync();
            var result = tours.Select(t => ToPublicTour(t, false));
            return Ok(result);
        }

        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id, [FromQuery] bool purchased = false)
        {
            var tour = await _repo.GetByIdAsync(id);
            if (tour == null) return NotFound();

            var userId = GetUserId();
            if (tour.AuthorId == userId) return Ok(tour);

            if (tour.Status == TourStatus.Draft) return Forbid();
            return Ok(ToPublicTour(tour, purchased));
        }

        [Authorize]
        [HttpGet("{id:int}/keypoints")]
        public async Task<IActionResult> KeyPoints(int id)
        {
            var tour = await _repo.GetByIdAsync(id);
            if (tour == null) return NotFound();
            return Ok(tour.KeyPoints.OrderBy(k => k.Order));
        }

        [Authorize]
        [HttpPost("{id:int}/keypoints")]
        public async Task<IActionResult> AddKeyPoint(int id, [FromBody] AddKeyPointRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var tour = await _repo.GetByIdAsync(id);
            if (tour == null) return NotFound();
            if (tour.AuthorId != userId.Value) return Forbid();
            if (tour.Status != TourStatus.Draft)
                return BadRequest(new { message = "Kljucne tacke se dodaju samo na draft ture." });

            var kp = new KeyPoint
            {
                Id = (tour.KeyPoints.LastOrDefault()?.Id ?? 0) + 1,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim() ?? string.Empty,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                Image = request.Image?.Trim() ?? string.Empty,
                Order = tour.KeyPoints.Count + 1
            };

            if (tour.KeyPoints.Count >= 1)
            {
                var prev = tour.KeyPoints.OrderBy(k => k.Order).Last();
                tour.LengthKm += GeoHelper.DistanceKm(prev.Latitude, prev.Longitude, kp.Latitude, kp.Longitude);
            }

            tour.KeyPoints.Add(kp);
            await _repo.ReplaceAsync(tour);
            return Ok(tour);
        }

        [Authorize]
        [HttpPost("{id:int}/publish")]
        public async Task<IActionResult> Publish(int id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var tour = await _repo.GetByIdAsync(id);
            if (tour == null) return NotFound();
            if (tour.AuthorId != userId.Value) return Forbid();

            if (string.IsNullOrWhiteSpace(tour.Name) || string.IsNullOrWhiteSpace(tour.Description) || tour.Tags.Count == 0)
                return BadRequest(new { message = "Tura mora imati naziv, opis i tagove." });
            if (tour.KeyPoints.Count < 2)
                return BadRequest(new { message = "Tura mora imati bar dve kljucne tacke." });

            tour.Status = TourStatus.Published;
            tour.PublishedAt = DateTime.UtcNow;
            if (tour.Price <= 0) tour.Price = 10;
            await _repo.ReplaceAsync(tour);
            return Ok(tour);
        }

        [Authorize]
        [HttpPost("{id:int}/price")]
        public async Task<IActionResult> SetPrice(int id, [FromBody] double price)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var tour = await _repo.GetByIdAsync(id);
            if (tour == null) return NotFound();
            if (tour.AuthorId != userId.Value) return Forbid();
            tour.Price = price;
            await _repo.ReplaceAsync(tour);
            return Ok(tour);
        }

        private static object ToPublicTour(Tour tour, bool purchased)
        {
            var first = tour.KeyPoints.OrderBy(k => k.Order).FirstOrDefault();
            return new
            {
                tour.Id,
                tour.AuthorId,
                tour.Name,
                tour.Description,
                tour.Difficulty,
                tour.Tags,
                tour.Status,
                tour.Price,
                tour.LengthKm,
                tour.PublishedAt,
                FirstKeyPoint = first,
                KeyPoints = purchased
                    ? tour.KeyPoints.OrderBy(k => k.Order).ToList()
                    : (first != null ? new List<KeyPoint> { first } : new List<KeyPoint>()),
                Revealed = purchased
            };
        }

        private int? GetUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue("sub");
            return int.TryParse(value, out var id) ? id : null;
        }
    }
}
