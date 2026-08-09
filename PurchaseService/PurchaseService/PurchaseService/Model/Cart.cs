using MongoDB.Bson.Serialization.Attributes;

namespace PurchaseService.Model
{
    public class OrderItem
    {
        public int TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public double Price { get; set; }
    }

    public class ShoppingCart
    {
        [BsonId]
        public int Id { get; set; }
        public int TouristId { get; set; }
        public List<OrderItem> Items { get; set; } = new();
        public double TotalPrice => Items.Sum(i => i.Price);
    }

    public class TourPurchaseToken
    {
        [BsonId]
        public int Id { get; set; }
        public int TouristId { get; set; }
        public int TourId { get; set; }
        public string TourName { get; set; } = string.Empty;
        public double Price { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
    }
}
