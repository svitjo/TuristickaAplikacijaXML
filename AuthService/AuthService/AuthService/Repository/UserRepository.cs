using AuthService.Model;
using AuthService.Model.Enum;
using MongoDB.Driver;

namespace AuthService.Repository
{
    public class UserRepository
    {
        private readonly IMongoCollection<User> _users;

        public UserRepository(AuthMongoDB mongo)
        {
            _users = mongo.Users;
        }

        public async Task<User?> GetByUserNameAsync(string userName)
        {
            return await _users.Find(u => u.UserName == userName).FirstOrDefaultAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

        public async Task<User?> GetByIdAsync(int userId)
        {
            return await _users.Find(u => u.UserId == userId).FirstOrDefaultAsync();
        }

        public async Task<User> CreateAsync(User user)
        {
            var lastUser = await _users.Find(_ => true)
                .SortByDescending(u => u.UserId)
                .Limit(1)
                .FirstOrDefaultAsync();

            user.UserId = (lastUser?.UserId ?? 0) + 1;
            user.CreatedAt = DateTime.UtcNow;
            await _users.InsertOneAsync(user);
            return user;
        }

        public async Task EnsureAdminExistsAsync()
        {
            var adminExists = await _users.Find(u => u.UserRole == UserRole.Administrator).AnyAsync();
            if (adminExists)
            {
                return;
            }

            var admin = new User
            {
                UserName = "admin",
                Email = "admin@touris.local",
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                FirstName = "Admin",
                LastName = "User",
                UserRole = UserRole.Administrator
            };

            await CreateAsync(admin);
        }
    }
}
