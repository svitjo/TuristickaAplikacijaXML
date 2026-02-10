using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using AuthService.Model;

namespace AuthService
{
    public class AuthMongoDB
    {
        private readonly IMongoCollection<User> _users;

        public AuthMongoDB(string connectionString, string databaseName)
        {
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            _users = database.GetCollection<User>("Users");
        }
    }
}
