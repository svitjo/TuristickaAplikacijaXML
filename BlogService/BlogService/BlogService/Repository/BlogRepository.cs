using BlogService.Model;
using MongoDB.Driver;

namespace BlogService.Repository
{
    public class BlogRepository
    {
        private readonly BlogMongoDB _db;

        public BlogRepository(BlogMongoDB db) => _db = db;

        public async Task<BlogPost> CreateAsync(BlogPost blog)
        {
            var last = await _db.Blogs.Find(_ => true).SortByDescending(b => b.Id).Limit(1).FirstOrDefaultAsync();
            blog.Id = (last?.Id ?? 0) + 1;
            blog.CreatedAt = DateTime.UtcNow;
            await _db.Blogs.InsertOneAsync(blog);
            return blog;
        }

        public async Task<BlogPost?> GetByIdAsync(int id) =>
            await _db.Blogs.Find(b => b.Id == id).FirstOrDefaultAsync();

        public async Task<List<BlogPost>> GetByAuthorIdsAsync(IEnumerable<int> authorIds) =>
            await _db.Blogs.Find(b => authorIds.Contains(b.AuthorId)).SortByDescending(b => b.CreatedAt).ToListAsync();

        public async Task<List<BlogPost>> GetByAuthorIdAsync(int authorId) =>
            await _db.Blogs.Find(b => b.AuthorId == authorId).SortByDescending(b => b.CreatedAt).ToListAsync();

        public async Task<Follow?> GetFollowAsync(int followerId, int followingId) =>
            await _db.Follows.Find(f => f.FollowerId == followerId && f.FollowingId == followingId).FirstOrDefaultAsync();

        public async Task<Follow> FollowAsync(int followerId, int followingId)
        {
            var existing = await GetFollowAsync(followerId, followingId);
            if (existing != null) return existing;
            var last = await _db.Follows.Find(_ => true).SortByDescending(f => f.Id).Limit(1).FirstOrDefaultAsync();
            var follow = new Follow
            {
                Id = (last?.Id ?? 0) + 1,
                FollowerId = followerId,
                FollowingId = followingId,
                CreatedAt = DateTime.UtcNow
            };
            await _db.Follows.InsertOneAsync(follow);
            return follow;
        }

        public async Task<bool> UnfollowAsync(int followerId, int followingId)
        {
            var result = await _db.Follows.DeleteOneAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);
            return result.DeletedCount > 0;
        }

        public async Task<List<int>> GetFollowingIdsAsync(int followerId)
        {
            var follows = await _db.Follows.Find(f => f.FollowerId == followerId).ToListAsync();
            return follows.Select(f => f.FollowingId).ToList();
        }

        public async Task<List<int>> GetRecommendationsAsync(int userId)
        {
            var following = await GetFollowingIdsAsync(userId);
            if (following.Count == 0) return new List<int>();

            var secondDegree = await _db.Follows.Find(f => following.Contains(f.FollowerId) && f.FollowingId != userId && !following.Contains(f.FollowingId)).ToListAsync();
            return secondDegree.Select(f => f.FollowingId).Distinct().ToList();
        }

        public async Task<Comment> AddCommentAsync(Comment comment)
        {
            var last = await _db.Comments.Find(_ => true).SortByDescending(c => c.Id).Limit(1).FirstOrDefaultAsync();
            comment.Id = (last?.Id ?? 0) + 1;
            comment.CreatedAt = DateTime.UtcNow;
            comment.UpdatedAt = DateTime.UtcNow;
            await _db.Comments.InsertOneAsync(comment);
            return comment;
        }

        public async Task<List<Comment>> GetCommentsAsync(int blogId) =>
            await _db.Comments.Find(c => c.BlogId == blogId).SortBy(c => c.CreatedAt).ToListAsync();
    }
}
