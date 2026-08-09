using System.ComponentModel.DataAnnotations;

namespace BlogService.DTO
{
    public class CreateBlogRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        [Required]
        public string Description { get; set; } = string.Empty;
        public List<string>? Images { get; set; }
    }
}
