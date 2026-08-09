using MongoDB.Bson.Serialization.Attributes;

namespace BlogService.Model
{
    public class BlogPost
    {
        [BsonId]
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public string AuthorUserName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Images { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
