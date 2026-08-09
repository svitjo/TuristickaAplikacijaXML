using MongoDB.Driver;
using PurchaseService.Model;

namespace PurchaseService.Repository
{
    public class PurchaseRepository
    {
        private readonly PurchaseMongoDB _db;
        public PurchaseRepository(PurchaseMongoDB db) => _db = db;

        public async Task<ShoppingCart> GetOrCreateCartAsync(int touristId)
        {
            var cart = await _db.Carts.Find(c => c.TouristId == touristId).FirstOrDefaultAsync();
            if (cart != null) return cart;
            var last = await _db.Carts.Find(_ => true).SortByDescending(c => c.Id).Limit(1).FirstOrDefaultAsync();
            cart = new ShoppingCart { Id = (last?.Id ?? 0) + 1, TouristId = touristId };
            await _db.Carts.InsertOneAsync(cart);
            return cart;
        }

        public async Task ReplaceCartAsync(ShoppingCart cart) =>
            await _db.Carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);

        public async Task<List<TourPurchaseToken>> CheckoutAsync(ShoppingCart cart)
        {
            var tokens = new List<TourPurchaseToken>();
            var last = await _db.Tokens.Find(_ => true).SortByDescending(t => t.Id).Limit(1).FirstOrDefaultAsync();
            var nextId = (last?.Id ?? 0) + 1;
            foreach (var item in cart.Items)
            {
                var existing = await _db.Tokens.Find(t => t.TouristId == cart.TouristId && t.TourId == item.TourId).FirstOrDefaultAsync();
                if (existing != null) { tokens.Add(existing); continue; }
                var token = new TourPurchaseToken
                {
                    Id = nextId++,
                    TouristId = cart.TouristId,
                    TourId = item.TourId,
                    TourName = item.TourName,
                    Price = item.Price,
                    Token = Guid.NewGuid().ToString("N"),
                    PurchasedAt = DateTime.UtcNow
                };
                await _db.Tokens.InsertOneAsync(token);
                tokens.Add(token);
            }
            cart.Items.Clear();
            await ReplaceCartAsync(cart);
            return tokens;
        }

        public async Task<bool> HasPurchasedAsync(int touristId, int tourId) =>
            await _db.Tokens.Find(t => t.TouristId == touristId && t.TourId == tourId).AnyAsync();

        public async Task<List<TourPurchaseToken>> GetPurchasesAsync(int touristId) =>
            await _db.Tokens.Find(t => t.TouristId == touristId).ToListAsync();
    }
}
