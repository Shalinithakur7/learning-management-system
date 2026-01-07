using System;
using System.ComponentModel.DataAnnotations;

namespace LMS.Api.Models
{
    public class Course
    {
        [Key]
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public bool IsPublished { get; set; }
        public CourseStatus Status { get; set; } = CourseStatus.Draft;
        public string? RejectionReason { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public required string InstructorId { get; set; }
        public decimal Price { get; set; }
        public ICollection<Module> Modules { get; set; } = new List<Module>();
    }
}
