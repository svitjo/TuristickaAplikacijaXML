using AuthService.Model.Enum;

namespace AuthService.DTO
{
    public class UserResponse
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Biography { get; set; } = string.Empty;
        public string Motto { get; set; } = string.Empty;
        public string ProfileImage { get; set; } = string.Empty;
        public UserRole UserRole { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
