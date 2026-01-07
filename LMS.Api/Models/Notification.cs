using System;
using System.ComponentModel.DataAnnotations;

namespace LMS.Api.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string Type { get; set; } // e.g., "Registration", "CourseApproval"
        public string? RelatedEntityId { get; set; } // e.g., UserId or CourseId
    }
}
