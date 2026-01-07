namespace LMS.Api.DTOs
{
    public class AdminEnrollmentDto
    {
        public int Id { get; set; }
        public string StudentId { get; set; }
        public string StudentName { get; set; }
        public string StudentEmail { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public DateTime EnrolledOn { get; set; }
        public string Status { get; set; }
    }
}
