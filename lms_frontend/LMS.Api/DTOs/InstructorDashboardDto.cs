using System;
using System.Collections.Generic;

namespace LMS.Api.DTOs
{
    public class InstructorDashboardDto
    {
        public int TotalCourses { get; set; }
        public int TotalStudents { get; set; }
        public int TotalAssignments { get; set; }
        public int PendingSubmissions { get; set; }
        public double AverageProgress { get; set; }
        public List<RecentSubmissionDto> RecentSubmissions { get; set; } = new List<RecentSubmissionDto>();
        public List<CourseLiteDto> Courses { get; set; } = new List<CourseLiteDto>();
    }

    public class CourseLiteDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public bool IsPublished { get; set; }
        public string Status { get; set; }
    }

    public class RecentSubmissionDto
    {
        public int Id { get; set; }
        public string StudentId { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty; // Ideally fetch this
        public string AssignmentTitle { get; set; } = string.Empty;
        public string CourseTitle { get; set; } = string.Empty;
        public DateTime SubmittedOn { get; set; }
        public string Status { get; set; } = "Submitted"; // or Graded
    }
}
