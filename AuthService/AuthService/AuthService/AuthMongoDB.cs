using AuthService.Model;
using MongoDB.Driver;

namespace AuthService
{
    public class AuthMongoDB
    {
        public IMongoCollection<User> Users { get; }

        public AuthMongoDB(string connectionString, string databaseName)
        {
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            Users = database.GetCollection<User>("Users");
        }
    }
}
