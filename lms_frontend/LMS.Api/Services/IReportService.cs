using LMS.Api.DTOs;

namespace LMS.Api.Services
{
    public interface IReportService
    {
        Task<List<CourseEnrollmentReportDto>> GetCourseEnrollmentStatsAsync();
        Task<List<StudentCourseGroupDto>> GetStudentsGroupedByCourseAsync();
        Task<List<AssignmentSubmissionReportDto>> GetAssignmentSubmissionStatsAsync();
        Task<List<StudentProgressReportDto>> GetStudentProgressReportsAsync(int? courseId = null);
    }
}
