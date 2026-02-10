using AuthService.Model.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AuthService.Model
{
    public class User
    {
        [BsonId] 
        public int UserId { get; set; }

        [BsonElement("username")]
        public string UserName { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("password")]
        public string Password { get; set; }

        [BsonElement("firstName")]
        public string FirstName { get; set; }

        [BsonElement("lastName")]
        public string LastName { get; set; }

        [BsonElement("biography")]
        public string Biography { get; set; }

        [BsonElement("motto")]
        public string Motto { get; set; }

        [BsonElement("profileImage")]
        public string ProfileImage { get; set; }

        [BsonElement("userRole")]
        public UserRole UserRole { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
