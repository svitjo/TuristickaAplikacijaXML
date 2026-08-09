using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PurchaseService.DTO;
using PurchaseService.Model;
using PurchaseService.Repository;

namespace PurchaseService.Controllers
{
    [ApiController]
    [Route("api/purchase")]
    public class PurchaseController : ControllerBase
    {
        private readonly PurchaseRepository _repo;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;

        public PurchaseController(PurchaseRepository repo, IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _repo = repo;
            _httpClientFactory = httpClientFactory;
            _config = config;
        }

        [Authorize]
        [HttpGet("cart")]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var cart = await _repo.GetOrCreateCartAsync(userId.Value);
            return Ok(new { cart.Id, cart.TouristId, cart.Items, totalPrice = cart.TotalPrice });
        }

        [Authorize]
        [HttpPost("cart/items")]
        public async Task<IActionResult> AddItem([FromBody] AddToCartRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            if (!User.IsInRole("Turista") && !User.IsInRole("Administrator"))
                return Forbid();

            // Validate tour is published via TourService
            var client = _httpClientFactory.CreateClient();
            var tourBase = _config["Services:Tour"] ?? "http://localhost:5003";
            var authHeader = Request.Headers.Authorization.ToString();
            var msg = new HttpRequestMessage(HttpMethod.Get, $"{tourBase}/api/tours/{request.TourId}");
            if (!string.IsNullOrEmpty(authHeader)) msg.Headers.TryAddWithoutValidation("Authorization", authHeader);
            var response = await client.SendAsync(msg);
            if (!response.IsSuccessStatusCode)
                return BadRequest(new { message = "Tura nije pronadjena." });

            var json = await response.Content.ReadFromJsonAsync<TourInfo>();
            if (json == null || json.Status != 1)
                return BadRequest(new { message = "Mogu se kupiti samo objavljene ture." });

            if (await _repo.HasPurchasedAsync(userId.Value, request.TourId))
                return BadRequest(new { message = "Tura je vec kupljena." });

            var cart = await _repo.GetOrCreateCartAsync(userId.Value);
            if (cart.Items.Any(i => i.TourId == request.TourId))
                return BadRequest(new { message = "Tura je vec u korpi." });

            cart.Items.Add(new OrderItem
            {
                TourId = request.TourId,
                TourName = string.IsNullOrWhiteSpace(request.TourName) ? json.Name : request.TourName,
                Price = request.Price > 0 ? request.Price : json.Price
            });
            await _repo.ReplaceCartAsync(cart);
            return Ok(new { cart.Id, cart.TouristId, cart.Items, totalPrice = cart.TotalPrice });
        }

        [Authorize]
        [HttpDelete("cart/items/{tourId:int}")]
        public async Task<IActionResult> RemoveItem(int tourId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var cart = await _repo.GetOrCreateCartAsync(userId.Value);
            cart.Items.RemoveAll(i => i.TourId == tourId);
            await _repo.ReplaceCartAsync(cart);
            return Ok(new { cart.Id, cart.TouristId, cart.Items, totalPrice = cart.TotalPrice });
        }

        [Authorize]
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var cart = await _repo.GetOrCreateCartAsync(userId.Value);
            if (cart.Items.Count == 0)
                return BadRequest(new { message = "Korpa je prazna." });
            var tokens = await _repo.CheckoutAsync(cart);
            return Ok(tokens);
        }

        [Authorize]
        [HttpGet("purchases")]
        public async Task<IActionResult> Purchases()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _repo.GetPurchasesAsync(userId.Value));
        }

        [Authorize]
        [HttpGet("purchases/{tourId:int}/has")]
        public async Task<IActionResult> HasPurchased(int tourId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(new { purchased = await _repo.HasPurchasedAsync(userId.Value, tourId) });
        }

        private int? GetUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue("sub");
            return int.TryParse(value, out var id) ? id : null;
        }

        private class TourInfo
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public double Price { get; set; }
            public int Status { get; set; }
        }
    }
}
