namespace AuthService.DTO
{
    public class UpdateProfileRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Biography { get; set; } = string.Empty;
        public string Motto { get; set; } = string.Empty;
        public string ProfileImage { get; set; } = string.Empty;
    }
}
