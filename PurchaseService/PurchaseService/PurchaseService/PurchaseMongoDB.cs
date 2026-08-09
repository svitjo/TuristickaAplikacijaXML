using MongoDB.Driver;
using PurchaseService.Model;

namespace PurchaseService
{
    public class PurchaseMongoDB
    {
        public IMongoCollection<ShoppingCart> Carts { get; }
        public IMongoCollection<TourPurchaseToken> Tokens { get; }
        public PurchaseMongoDB(string cs, string db)
        {
            var database = new MongoClient(cs).GetDatabase(db);
            Carts = database.GetCollection<ShoppingCart>("Carts");
            Tokens = database.GetCollection<TourPurchaseToken>("PurchaseTokens");
        }
    }
}
