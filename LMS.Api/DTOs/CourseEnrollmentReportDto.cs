namespace LMS.Api.DTOs
{
    public class CourseEnrollmentReportDto
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int TotalEnrollments { get; set; }
    }
}
