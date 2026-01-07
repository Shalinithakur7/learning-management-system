namespace LMS.Api.DTOs
{
    public class UserManagementDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? RequestedRole { get; set; }
        public string CurrentRole { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
    }

    public class ApproveUserDto
    {
        // No body needed - approval assigns requestedRole
    }

    public class RejectUserDto
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class ChangeRoleDto
    {
        public string NewRole { get; set; } = string.Empty;  // INSTRUCTOR or STUDENT
    }
}
