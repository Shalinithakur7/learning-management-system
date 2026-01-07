namespace LMS.Api.DTOs
{
    public class AdminStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalInstructors { get; set; }
        public int TotalStudents { get; set; }
        public int TotalCourses { get; set; }
        public int ActiveCourses { get; set; }
        public int PendingApprovals { get; set; }
    }
}
