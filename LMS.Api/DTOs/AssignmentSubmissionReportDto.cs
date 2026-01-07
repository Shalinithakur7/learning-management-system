namespace LMS.Api.DTOs
{
    public class AssignmentSubmissionReportDto
    {
        public int AssignmentId { get; set; }
        public string AssignmentTitle { get; set; }
        public string CourseTitle { get; set; }
        public int TotalSubmissions { get; set; }
        public int TotalStudents { get; set; }
        public int PendingSubmissions { get; set; }
    }
}
