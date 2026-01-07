using System.ComponentModel.DataAnnotations;

namespace LMS.Api.Models
{
    public class Submission
    {
        [Key]
        public int Id { get; set; }
        public int AssignmentId { get; set; }
        public string StudentId { get; set; }
        public string? Content { get; set; } // Student's answer/link
        public string? FilePath { get; set; } // Keep for backward compatibility
        public DateTime SubmittedOn { get; set; }
        public int? Marks { get; set; } // Keep for backward compatibility
        public int? Grade { get; set; } // New grading field
        public string? Feedback { get; set; } // Instructor feedback
        public string? Status { get; set; } // Pending, Submitted, Graded

        public virtual Assignment Assignment { get; set; }
        public virtual ApplicationUser Student { get; set; } // Navigation property for student
    }
}
