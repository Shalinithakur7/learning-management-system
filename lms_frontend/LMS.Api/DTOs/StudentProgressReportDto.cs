namespace LMS.Api.DTOs
{
    public class StudentProgressReportDto
    {
        public string StudentId { get; set; }
        public string StudentName { get; set; }
        public string StudentEmail { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public double ProgressPercentage { get; set; }
    }
}
