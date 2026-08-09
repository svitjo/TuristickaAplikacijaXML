using MongoDB.Driver;
using TourExecutionService.Model;

namespace TourExecutionService.Repository
{
    public class ExecutionRepository
    {
        private readonly ExecutionMongoDB _db;
        public ExecutionRepository(ExecutionMongoDB db) => _db = db;

        public async Task<TouristPosition> UpsertPositionAsync(int touristId, double lat, double lng)
        {
            var existing = await _db.Positions.Find(p => p.TouristId == touristId).FirstOrDefaultAsync();
            if (existing == null)
            {
                var last = await _db.Positions.Find(_ => true).SortByDescending(p => p.Id).Limit(1).FirstOrDefaultAsync();
                existing = new TouristPosition { Id = (last?.Id ?? 0) + 1, TouristId = touristId };
            }
            existing.Latitude = lat;
            existing.Longitude = lng;
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.Positions.ReplaceOneAsync(p => p.TouristId == touristId, existing, new ReplaceOptions { IsUpsert = true });
            return existing;
        }

        public async Task<TouristPosition?> GetPositionAsync(int touristId) =>
            await _db.Positions.Find(p => p.TouristId == touristId).FirstOrDefaultAsync();

        public async Task<TourExecution?> GetActiveAsync(int touristId) =>
            await _db.Executions.Find(e => e.TouristId == touristId && e.Status == ExecutionStatus.Active).FirstOrDefaultAsync();

        public async Task<TourExecution?> GetByIdAsync(int id) =>
            await _db.Executions.Find(e => e.Id == id).FirstOrDefaultAsync();

        public async Task<TourExecution> CreateAsync(TourExecution execution)
        {
            var last = await _db.Executions.Find(_ => true).SortByDescending(e => e.Id).Limit(1).FirstOrDefaultAsync();
            execution.Id = (last?.Id ?? 0) + 1;
            await _db.Executions.InsertOneAsync(execution);
            return execution;
        }

        public async Task ReplaceAsync(TourExecution execution) =>
            await _db.Executions.ReplaceOneAsync(e => e.Id == execution.Id, execution);
    }
}
