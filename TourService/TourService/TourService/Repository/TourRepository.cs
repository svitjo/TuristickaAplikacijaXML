using MongoDB.Driver;
using TourService.Model;

namespace TourService.Repository
{
    public class TourRepository
    {
        private readonly IMongoCollection<Tour> _tours;
        public TourRepository(TourMongoDB db) => _tours = db.Tours;

        public async Task<Tour> CreateAsync(Tour tour)
        {
            var last = await _tours.Find(_ => true).SortByDescending(t => t.Id).Limit(1).FirstOrDefaultAsync();
            tour.Id = (last?.Id ?? 0) + 1;
            tour.Status = TourStatus.Draft;
            tour.Price = 0;
            tour.CreatedAt = DateTime.UtcNow;
            await _tours.InsertOneAsync(tour);
            return tour;
        }

        public async Task<Tour?> GetByIdAsync(int id) =>
            await _tours.Find(t => t.Id == id).FirstOrDefaultAsync();

        public async Task<List<Tour>> GetByAuthorAsync(int authorId) =>
            await _tours.Find(t => t.AuthorId == authorId).SortByDescending(t => t.CreatedAt).ToListAsync();

        public async Task<List<Tour>> GetPublishedAsync() =>
            await _tours.Find(t => t.Status == TourStatus.Published).SortByDescending(t => t.PublishedAt).ToListAsync();

        public async Task ReplaceAsync(Tour tour) =>
            await _tours.ReplaceOneAsync(t => t.Id == tour.Id, tour);
    }
}
