using LMS.Api.DTOs;
using LMS.Api.Services;
using LMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _courseService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly LMS.Api.Data.ApplicationDbContext _context;

        public CoursesController(ICourseService courseService,
            UserManager<ApplicationUser> userManager,
            LMS.Api.Data.ApplicationDbContext context)
        {
            _courseService = courseService;
            _userManager = userManager;
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var courses = await _courseService.GetAllCoursesAsync();
            
            var dtos = new List<CourseDto>();
            foreach (var c in courses)
            {
                var instructor = await _userManager.FindByIdAsync(c.InstructorId);
                dtos.Add(new CourseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    Price = c.Price,
                    InstructorId = c.InstructorId,
                    InstructorName = instructor?.FullName ?? "Unknown",
                    IsPublished = c.IsPublished,
                    Status = c.Status.ToString(),
                    RejectionReason = c.RejectionReason,
                    CreatedAt = c.CreatedAt,
                    SubmittedAt = c.SubmittedAt,
                    ApprovedAt = c.ApprovedAt
                });
            }
            
            return Ok(dtos);
        }

        [HttpPost]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> Create(CourseDto dto)
        {
            var instructorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var course = await _courseService.CreateCourseAsync(dto, instructorId);
            return Ok(course);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> Update(int id, CourseDto dto)
        {
            var course = await _courseService.UpdateCourseAsync(id, dto);
            if (course == null) return NotFound();
            return Ok(course);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var course = await _courseService.GetCourseByIdAsync(id);
            if (course == null) return NotFound();

            // ACCESS CONTROL: Hide content if Student is not enrolled/approved
            if (User.IsInRole("Student") || User.IsInRole("STUDENT"))
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var enrollment = _context.Enrollments.FirstOrDefault(e => e.StudentId == userId && e.CourseId == id);

                // If no enrollment OR not approved, hide content
                if (enrollment == null || !string.Equals(enrollment.Status, "Approved", StringComparison.OrdinalIgnoreCase))
                {
                    course.Modules = new List<Module>(); // Hide modules/lessons
                }
            }

            return Ok(course);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> Delete(int id)
        {
            await _courseService.DeleteCourseAsync(id);
            return Ok();
        }

        [HttpPost("{courseId}/modules")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> AddModule(int courseId, [FromBody] ModuleDto dto)
        {
            var module = await _courseService.AddModuleAsync(courseId, dto);
            return Ok(module);
        }

        [HttpPost("modules/{moduleId}/lessons")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> AddLesson(int moduleId, [FromBody] LessonDto dto)
        {
            var lesson = await _courseService.AddLessonAsync(moduleId, dto);
            return Ok(lesson);
        }

        [HttpPost("modules/{moduleId}/lessons/upload")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> AddLessonWithVideo(int moduleId, [FromForm] LessonUploadDto dto)
        {
            var lesson = await _courseService.AddLessonWithVideoAsync(moduleId, dto);
            return Ok(lesson);
        }
        [HttpDelete("modules/{moduleId}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> DeleteModule(int moduleId)
        {
            await _courseService.DeleteModuleAsync(moduleId);
            return Ok();
        }

        [HttpDelete("lessons/{lessonId}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> DeleteLesson(int lessonId)
        {
            await _courseService.DeleteLessonAsync(lessonId);
            return Ok();
        }
        [HttpPost("{courseId}/publish")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> Publish(int courseId)
        {
            // For backward compatibility, but now sets status to Pending
            await _courseService.SubmitForApprovalAsync(courseId);
            return Ok();
        }

        [HttpPost("{courseId}/submit-for-approval")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> SubmitForApproval(int courseId)
        {
            await _courseService.SubmitForApprovalAsync(courseId);
            return Ok();
        }

        [HttpPost("{courseId}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveCourse(int courseId)
        {
            await _courseService.ApproveCourseAsync(courseId);
            return Ok();
        }

        [HttpPost("{courseId}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectCourse(int courseId, [FromBody] RejectCourseDto dto)
        {
            await _courseService.RejectCourseAsync(courseId, dto.Reason);
            return Ok();
        }

        [HttpGet("my")]
        [Authorize(Roles = "Instructor")]
        public IActionResult GetMyCourses()
        {
            var instructorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Query directly without Include to avoid timeout
            var courses = _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .Select(c => new CourseDto
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
                })
                .ToList();
            
            return Ok(courses);
        }
    }
}
