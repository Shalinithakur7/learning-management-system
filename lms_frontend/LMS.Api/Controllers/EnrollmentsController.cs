using LMS.Api.Data;
using LMS.Api.DTOs;
using LMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace LMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnrollmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public EnrollmentsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpPost]
        [Authorize(Roles = "Student,STUDENT")]
        public IActionResult Enroll(EnrollmentDto dto)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var existingEnrollment = _context.Enrollments
                .FirstOrDefault(e => e.StudentId == studentId && e.CourseId == dto.CourseId);

            if (existingEnrollment != null)
            {
                // Check case-insensitive "Rejected"
                if (string.Equals(existingEnrollment.Status, "Rejected", StringComparison.OrdinalIgnoreCase))
                {
                    // Re-activate the enrollment as Pending
                    existingEnrollment.Status = "Pending";
                    existingEnrollment.EnrolledOn = DateTime.Now;
                    _context.SaveChanges();
                    return Ok(new { message = "Enrollment request sent again", enrollmentId = existingEnrollment.Id });
                }
                
                return BadRequest(new { message = $"Already enrolled in this course (Status: {existingEnrollment.Status})" });
            }

            var enrollment = new Enrollment
            {
                StudentId = studentId,
                CourseId = dto.CourseId,
                EnrolledOn = DateTime.Now,
                Status = "Pending"
            };

            _context.Enrollments.Add(enrollment);
            _context.SaveChanges();

            return Ok(new { message = "Enrollment request sent", enrollmentId = enrollment.Id });
        }

        [HttpGet("my")]
        [Authorize(Roles = "Student,STUDENT")]
        public async Task<IActionResult> MyEnrollments()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Get enrollments first
            var enrollments = _context.Enrollments
                .Where(e => e.StudentId == studentId)
                .OrderByDescending(e => e.EnrolledOn)
                .ToList();

            // Build result with course and instructor info
            var result = new List<EnrollmentDetailDto>();
            foreach (var enrollment in enrollments)
            {
                var course = _context.Courses
                    .Include(c => c.Modules).ThenInclude(m => m.Lessons)
                    .FirstOrDefault(c => c.Id == enrollment.CourseId);

                if (course != null)
                {
                    var instructor = await _userManager.FindByIdAsync(course.InstructorId);
                    
                    List<int> completedIds = new List<int>();
                    if (!string.IsNullOrEmpty(enrollment.CompletedLessonIds))
                    {
                        try 
                        {
                            completedIds = System.Text.Json.JsonSerializer.Deserialize<List<int>>(enrollment.CompletedLessonIds) ?? new List<int>();
                        }
                        catch
                        {
                            // If JSON is invalid, default to empty list
                            completedIds = new List<int>();
                        }
                    }
                    var totalLessons = course.Modules?.Sum(m => m.Lessons?.Count ?? 0) ?? 0;
                    var progress = totalLessons > 0 ? (int)((double)completedIds.Count / totalLessons * 100) : 0;

                    result.Add(new EnrollmentDetailDto
                    {
                        Id = enrollment.Id,
                        StudentId = enrollment.StudentId,
                        CourseId = enrollment.CourseId,
                        CourseName = course.Title,
                        InstructorName = instructor?.FullName ?? "Unknown",
                        Status = enrollment.Status,
                        Progress = progress,
                        EnrolledDate = enrollment.EnrolledOn,
                        CompletedLessonIds = completedIds
                    });
                }
            }

            return Ok(result);
        }

        [HttpPost("{courseId}/complete/{lessonId}")]
        [Authorize(Roles = "Student,STUDENT")]
        public IActionResult CompleteLesson(int courseId, int lessonId)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var enrollment = _context.Enrollments.FirstOrDefault(e => e.StudentId == studentId && e.CourseId == courseId);

            if (enrollment == null) return NotFound("Enrollment not found");

            List<int> completedIds = new List<int>();
            if (!string.IsNullOrEmpty(enrollment.CompletedLessonIds))
            {
                try
                {
                    completedIds = System.Text.Json.JsonSerializer.Deserialize<List<int>>(enrollment.CompletedLessonIds) ?? new List<int>();
                }
                catch
                {
                    completedIds = new List<int>();
                }
            }

            if (!completedIds.Contains(lessonId))
            {
                completedIds.Add(lessonId);
                enrollment.CompletedLessonIds = System.Text.Json.JsonSerializer.Serialize(completedIds);
                _context.SaveChanges();
            }

            return Ok(new { message = "Lesson completed" });
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PendingApprovals()
        {
            var enrollments = _context.Enrollments
                .Where(e => e.Status == "Pending")
                .OrderBy(e => e.EnrolledOn)
                .ToList();

            var result = new List<AdminEnrollmentDto>();

            foreach (var enrollment in enrollments)
            {
                var student = await _userManager.FindByIdAsync(enrollment.StudentId);
                var course = _context.Courses.FirstOrDefault(c => c.Id == enrollment.CourseId);

                if (student != null && course != null)
                {
                    result.Add(new AdminEnrollmentDto
                    {
                        Id = enrollment.Id,
                        StudentId = enrollment.StudentId,
                        // Fallback to Email if Name is empty (for debugging/legacy users)
                        StudentName = !string.IsNullOrEmpty(student.FullName) ? student.FullName : $"({student.Email})",
                        StudentEmail = student.Email,
                        CourseId = enrollment.CourseId,
                        CourseTitle = course.Title,
                        EnrolledOn = enrollment.EnrolledOn,
                        Status = enrollment.Status
                    });
                }
            }

            return Ok(result);
        }

        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Approve(int id)
        {
            var enrollment = _context.Enrollments.FirstOrDefault(e => e.Id == id);
            if (enrollment == null) return NotFound();

            enrollment.Status = "Approved";
            _context.SaveChanges();

            return Ok(new { message = "Enrollment approved" });
        }

        [HttpPut("reject/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Reject(int id)
        {
            var enrollment = _context.Enrollments.FirstOrDefault(e => e.Id == id);
            if (enrollment == null) return NotFound();

            enrollment.Status = "Rejected";
            _context.SaveChanges();

            return Ok(new { message = "Enrollment rejected" });
        }
    }
}
