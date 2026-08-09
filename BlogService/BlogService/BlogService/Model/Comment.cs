using MongoDB.Bson.Serialization.Attributes;

namespace BlogService.Model
{
    public class Comment
    {
        [BsonId]
        public int Id { get; set; }
        public int BlogId { get; set; }
        public int AuthorId { get; set; }
        public string AuthorUserName { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
