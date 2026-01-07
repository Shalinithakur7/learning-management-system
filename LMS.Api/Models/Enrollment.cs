using System.ComponentModel.DataAnnotations;

namespace LMS.Api.Models
{
    public class Enrollment
    {
        [Key]
        public int Id { get; set; }
        public string StudentId { get; set; }
        public int CourseId { get; set; }
        public DateTime EnrolledOn { get; set; }
        public string Status { get; set; }
        public string CompletedLessonIds { get; set; } = "[]";
        
        public virtual Course Course { get; set; }
    }
}
