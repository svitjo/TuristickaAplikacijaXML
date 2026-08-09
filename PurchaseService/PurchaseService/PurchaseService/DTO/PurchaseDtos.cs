using System.ComponentModel.DataAnnotations;

namespace PurchaseService.DTO
{
    public class AddToCartRequest
    {
        [Required] public int TourId { get; set; }
        [Required] public string TourName { get; set; } = string.Empty;
        [Required] public double Price { get; set; }
    }
}
