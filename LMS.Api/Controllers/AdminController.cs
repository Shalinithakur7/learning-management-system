using LMS.Api.DTOs;
using LMS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public AdminController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet("courses")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCourses()
        {
            var courses = await _courseService.GetAllCoursesAsync();
            
            // Show only courses submitted for approval (Pending status)
            var pendingCourses = courses.Where(c => c.Status == Models.CourseStatus.Pending);
            
            var dtos = pendingCourses.Select(c => new CourseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Price = c.Price,
                InstructorId = c.InstructorId,
                IsPublished = c.IsPublished,
                Status = c.Status.ToString(),
                RejectionReason = c.RejectionReason,
                CreatedAt = c.CreatedAt,
                SubmittedAt = c.SubmittedAt,
                ApprovedAt = c.ApprovedAt
            });
            return Ok(dtos);
        }

        [HttpPut("courses/{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveCourse(int id)
        {
            await _courseService.ApproveCourseAsync(id);
            return Ok();
        }

        [HttpPut("courses/{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectCourse(int id, [FromBody] RejectCourseDto dto)
        {
            await _courseService.RejectCourseAsync(id, dto.Reason);
            return Ok();
        }

        // Get real stats
        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _courseService.GetAdminStatsAsync();
            return Ok(stats);
        }
    }
}
