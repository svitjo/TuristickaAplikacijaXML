using System.ComponentModel.DataAnnotations;

namespace BlogService.DTO
{
    public class FollowRequest
    {
        [Required]
        public int UserId { get; set; }
    }
}
