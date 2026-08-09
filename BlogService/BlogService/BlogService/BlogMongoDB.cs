using BlogService.Model;
using MongoDB.Driver;

namespace BlogService
{
    public class BlogMongoDB
    {
        public IMongoCollection<BlogPost> Blogs { get; }
        public IMongoCollection<Comment> Comments { get; }
        public IMongoCollection<Follow> Follows { get; }

        public BlogMongoDB(string connectionString, string databaseName)
        {
            var db = new MongoClient(connectionString).GetDatabase(databaseName);
            Blogs = db.GetCollection<BlogPost>("Blogs");
            Comments = db.GetCollection<Comment>("Comments");
            Follows = db.GetCollection<Follow>("Follows");
        }
    }
}
