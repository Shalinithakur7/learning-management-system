using Microsoft.AspNetCore.Http;

namespace LMS.Api.DTOs
{
    public class LessonUploadDto
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public IFormFile? VideoFile { get; set; }
    }
}
