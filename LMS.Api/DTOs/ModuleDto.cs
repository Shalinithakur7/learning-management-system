namespace LMS.Api.DTOs
{
    public class ModuleDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int CourseId { get; set; }
        public List<LessonDto>? Lessons { get; set; }
    }
}
