using Microsoft.AspNetCore.Identity;

namespace LMS.Api.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public string? RequestedRole { get; set; }  // Role requested during registration (Instructor/Student)
        public UserStatus Status { get; set; } = UserStatus.Pending;  // Approval status
        public string? RejectionReason { get; set; }  // Reason if rejected by admin
    }
}
