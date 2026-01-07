namespace LMS.Api.DTOs
{
    public class EnrollmentDetailDto
    {
        public int Id { get; set; }
        public string StudentId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public string InstructorName { get; set; }
        public string Status { get; set; }
        public int Progress { get; set; }
        public DateTime EnrolledDate { get; set; }
        public List<int> CompletedLessonIds { get; set; } = new List<int>();
    }
}
