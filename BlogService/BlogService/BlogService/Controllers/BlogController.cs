using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BlogService.DTO;
using BlogService.Model;
using BlogService.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogService.Controllers
{
    [ApiController]
    [Route("api/blogs")]
    public class BlogController : ControllerBase
    {
        private readonly BlogRepository _repo;

        public BlogController(BlogRepository repo) => _repo = repo;

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBlogRequest request)
        {
            var userId = GetUserId();
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "user";
            if (userId == null) return Unauthorized();

            var blog = await _repo.CreateAsync(new BlogPost
            {
                AuthorId = userId.Value,
                AuthorUserName = userName,
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Images = request.Images ?? new List<string>()
            });
            return Ok(blog);
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetFeed()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var following = await _repo.GetFollowingIdsAsync(userId.Value);
            following.Add(userId.Value);
            var blogs = await _repo.GetByAuthorIdsAsync(following);
            return Ok(blogs);
        }

        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var blog = await _repo.GetByIdAsync(id);
            if (blog == null) return NotFound();

            if (blog.AuthorId != userId.Value)
            {
                var follow = await _repo.GetFollowAsync(userId.Value, blog.AuthorId);
                if (follow == null) return Forbid();
            }

            var comments = await _repo.GetCommentsAsync(id);
            return Ok(new { blog, comments });
        }

        [Authorize]
        [HttpPost("{id:int}/comments")]
        public async Task<IActionResult> Comment(int id, [FromBody] CreateCommentRequest request)
        {
            var userId = GetUserId();
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "user";
            if (userId == null) return Unauthorized();

            var blog = await _repo.GetByIdAsync(id);
            if (blog == null) return NotFound();

            if (blog.AuthorId != userId.Value)
            {
                var follow = await _repo.GetFollowAsync(userId.Value, blog.AuthorId);
                if (follow == null)
                    return BadRequest(new { message = "Mozete komentarisati samo blogove korisnika koje pratite." });
            }

            var comment = await _repo.AddCommentAsync(new Comment
            {
                BlogId = id,
                AuthorId = userId.Value,
                AuthorUserName = userName,
                Text = request.Text.Trim()
            });
            return Ok(comment);
        }

        [Authorize]
        [HttpPost("follow")]
        public async Task<IActionResult> Follow([FromBody] FollowRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            if (request.UserId == userId.Value)
                return BadRequest(new { message = "Ne mozete zapratiti sami sebe." });

            var follow = await _repo.FollowAsync(userId.Value, request.UserId);
            return Ok(follow);
        }

        [Authorize]
        [HttpDelete("follow/{userId:int}")]
        public async Task<IActionResult> Unfollow(int userId)
        {
            var current = GetUserId();
            if (current == null) return Unauthorized();
            await _repo.UnfollowAsync(current.Value, userId);
            return Ok(new { message = "Unfollow uspesan." });
        }

        [Authorize]
        [HttpGet("following")]
        public async Task<IActionResult> Following()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _repo.GetFollowingIdsAsync(userId.Value));
        }

        [Authorize]
        [HttpGet("recommendations")]
        public async Task<IActionResult> Recommendations()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _repo.GetRecommendationsAsync(userId.Value));
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
