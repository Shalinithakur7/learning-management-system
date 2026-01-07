using System.ComponentModel.DataAnnotations;

namespace LMS.Api.Models
{
    public class Assignment
    {
        [Key]
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime DueDate { get; set; }
        public int CourseId { get; set; }

        public virtual Course Course { get; set; }
    }
}
