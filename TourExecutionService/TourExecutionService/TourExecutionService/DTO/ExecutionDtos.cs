using System.ComponentModel.DataAnnotations;

namespace TourExecutionService.DTO
{
    public class SetPositionRequest
    {
        [Required] public double Latitude { get; set; }
        [Required] public double Longitude { get; set; }
    }

    public class StartExecutionRequest
    {
        [Required] public int TourId { get; set; }
    }
}
