using MongoDB.Driver;
using TourExecutionService.Model;

namespace TourExecutionService
{
    public class ExecutionMongoDB
    {
        public IMongoCollection<TouristPosition> Positions { get; }
        public IMongoCollection<TourExecution> Executions { get; }
        public ExecutionMongoDB(string cs, string db)
        {
            var database = new MongoClient(cs).GetDatabase(db);
            Positions = database.GetCollection<TouristPosition>("Positions");
            Executions = database.GetCollection<TourExecution>("Executions");
        }
    }
}
