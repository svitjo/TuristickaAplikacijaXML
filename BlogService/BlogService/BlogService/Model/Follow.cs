using MongoDB.Bson.Serialization.Attributes;

namespace BlogService.Model
{
    public class Follow
    {
        [BsonId]
        public int Id { get; set; }
        public int FollowerId { get; set; }
        public int FollowingId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
