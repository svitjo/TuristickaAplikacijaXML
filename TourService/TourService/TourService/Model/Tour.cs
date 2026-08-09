using MongoDB.Bson.Serialization.Attributes;

namespace TourService.Model
{
    public enum TourStatus { Draft = 0, Published = 1, Archived = 2 }
    public enum TourDifficulty { Easy = 0, Medium = 1, Hard = 2 }

    public class KeyPoint
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Image { get; set; } = string.Empty;
        public int Order { get; set; }
    }

    public class Tour
    {
        [BsonId]
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TourDifficulty Difficulty { get; set; }
        public List<string> Tags { get; set; } = new();
        public TourStatus Status { get; set; } = TourStatus.Draft;
        public double Price { get; set; } = 0;
        public double LengthKm { get; set; } = 0;
        public List<KeyPoint> KeyPoints { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PublishedAt { get; set; }
        public DateTime? ArchivedAt { get; set; }
    }
}
