using LMS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Instructor")] // Restrict reports relative to roles if needed. 
    // Requirement didn't specify strict roles, assuming Admin/Instructor for reports.
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("enrollments")]
        public async Task<IActionResult> GetEnrollmentStats()
        {
            var data = await _reportService.GetCourseEnrollmentStatsAsync();
            return Ok(data);
        }

        [HttpGet("students-by-course")]
        public async Task<IActionResult> GetStudentsByCourse()
        {
            var data = await _reportService.GetStudentsGroupedByCourseAsync();
            return Ok(data);
        }

        [HttpGet("submissions")]
        public async Task<IActionResult> GetSubmissionStats()
        {
            var data = await _reportService.GetAssignmentSubmissionStatsAsync();
            return Ok(data);
        }

        [HttpGet("progress")]
        public async Task<IActionResult> GetStudentProgress([FromQuery] int? courseId)
        {
            var data = await _reportService.GetStudentProgressReportsAsync(courseId);
            return Ok(data);
        }
    }
}
