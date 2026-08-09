using AuthService.Model.Enum;
using MongoDB.Bson.Serialization.Attributes;

namespace AuthService.Model
{
    public class User
    {
        [BsonId]
        public int UserId { get; set; }

        [BsonElement("username")]
        public string UserName { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("password")]
        public string Password { get; set; } = string.Empty;

        [BsonElement("firstName")]
        public string FirstName { get; set; } = string.Empty;

        [BsonElement("lastName")]
        public string LastName { get; set; } = string.Empty;

        [BsonElement("biography")]
        public string Biography { get; set; } = string.Empty;

        [BsonElement("motto")]
        public string Motto { get; set; } = string.Empty;

        [BsonElement("profileImage")]
        public string ProfileImage { get; set; } = string.Empty;

        [BsonElement("userRole")]
        public UserRole UserRole { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
