using AuthService.DTO;
using AuthService.Model;
using AuthService.Model.Enum;
using AuthService.Repository;
using AuthService.Service;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserRepository _users;
        private readonly JwtTokenService _jwtTokenService;

        public AuthController(UserRepository users, JwtTokenService jwtTokenService)
        {
            _users = users;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            if (request.UserRole != UserRole.Vodic && request.UserRole != UserRole.Turista)
            {
                return BadRequest(new { message = "Dozvoljene uloge pri registraciji su Vodic i Turista." });
            }

            var existingUser = await _users.GetByUserNameAsync(request.UserName);
            if (existingUser != null)
            {
                return Conflict(new { message = "Korisnicko ime je zauzeto." });
            }

            var existingEmail = await _users.GetByEmailAsync(request.Email);
            if (existingEmail != null)
            {
                return Conflict(new { message = "Email je zauzet." });
            }

            var user = new User
            {
                UserName = request.UserName.Trim(),
                Email = request.Email.Trim(),
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                UserRole = request.UserRole
            };

            user = await _users.CreateAsync(user);
            var token = _jwtTokenService.GenerateToken(user);

            return Ok(ToAuthResponse(user, token));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var user = await _users.GetByUserNameAsync(request.UserName);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return Unauthorized(new { message = "Pogresno korisnicko ime ili lozinka." });
            }

            var token = _jwtTokenService.GenerateToken(user);
            return Ok(ToAuthResponse(user, token));
        }

        private static AuthResponse ToAuthResponse(User user, string token)
        {
            return new AuthResponse
            {
                Token = token,
                UserId = user.UserId,
                UserName = user.UserName,
                Email = user.Email,
                UserRole = user.UserRole
            };
        }
    }
}
