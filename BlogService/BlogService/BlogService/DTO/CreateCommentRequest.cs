using System.ComponentModel.DataAnnotations;

namespace BlogService.DTO
{
    public class CreateCommentRequest
    {
        [Required]
        public string Text { get; set; } = string.Empty;
    }
}
