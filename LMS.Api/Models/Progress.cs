using System.ComponentModel.DataAnnotations;

namespace LMS.Api.Models
{
    public class Progress
    {
        [Key]
        public int Id { get; set; }
        public string StudentId { get; set; }
        public int CourseId { get; set; }
        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }
        public double CompletionPercentage { get; set; }
    }
}
