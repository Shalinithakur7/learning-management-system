namespace LMS.Api.DTOs
{
    public class ProgressUpdateDto
    {
        public int CourseId { get; set; }
        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }
    }
}
