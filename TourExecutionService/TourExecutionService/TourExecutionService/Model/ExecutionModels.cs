using MongoDB.Bson.Serialization.Attributes;

namespace TourExecutionService.Model
{
    public enum ExecutionStatus { Active = 0, Completed = 1, Abandoned = 2 }

    public class TouristPosition
    {
        [BsonId]
        public int Id { get; set; }
        public int TouristId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CompletedKeyPoint
    {
        public int KeyPointId { get; set; }
        public DateTime CompletedAt { get; set; }
    }

    public class TourExecution
    {
        [BsonId]
        public int Id { get; set; }
        public int TourId { get; set; }
        public int TouristId { get; set; }
        public ExecutionStatus Status { get; set; } = ExecutionStatus.Active;
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EndedAt { get; set; }
        public DateTime LastActivity { get; set; } = DateTime.UtcNow;
        public List<CompletedKeyPoint> CompletedKeyPoints { get; set; } = new();
    }
}
