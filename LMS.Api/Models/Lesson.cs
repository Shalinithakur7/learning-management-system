using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LMS.Api.Models
{
    public class Lesson
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string Title { get; set; }

        public string? Content { get; set; } // Text content or description

        public string? VideoUrl { get; set; } // Optional video link

        public int ModuleId { get; set; }

        [ForeignKey("ModuleId")]
        [JsonIgnore]
        public Module? Module { get; set; }
    }
}
