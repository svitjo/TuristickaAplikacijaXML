using MongoDB.Driver;
using TourService.Model;

namespace TourService
{
    public class TourMongoDB
    {
        public IMongoCollection<Tour> Tours { get; }
        public TourMongoDB(string connectionString, string databaseName)
        {
            Tours = new MongoClient(connectionString).GetDatabase(databaseName).GetCollection<Tour>("Tours");
        }
    }
}
