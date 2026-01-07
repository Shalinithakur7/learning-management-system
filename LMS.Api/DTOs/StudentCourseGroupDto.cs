namespace LMS.Api.DTOs
{
    public class StudentCourseGroupDto
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public List<string> StudentNames { get; set; } = new List<string>();
    }
}
