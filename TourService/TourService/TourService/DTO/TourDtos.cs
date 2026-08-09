using System.ComponentModel.DataAnnotations;
using TourService.Model;

namespace TourService.DTO
{
    public class CreateTourRequest
    {
        [Required] public string Name { get; set; } = string.Empty;
        [Required] public string Description { get; set; } = string.Empty;
        [Required] public TourDifficulty Difficulty { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class AddKeyPointRequest
    {
        [Required] public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Required] public double Latitude { get; set; }
        [Required] public double Longitude { get; set; }
        public string Image { get; set; } = string.Empty;
    }
}
