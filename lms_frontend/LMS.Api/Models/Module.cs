using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LMS.Api.Models
{
    public class Module
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public required string Title { get; set; }
        
        public int CourseId { get; set; }
        
        [ForeignKey("CourseId")]
        [JsonIgnore] // Prevent cyclic reference
        public Course? Course { get; set; }

        public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    }
}
