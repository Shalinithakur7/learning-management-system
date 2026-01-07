using LMS.Api.Data;
using LMS.Api.DTOs;
using LMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Added for Include()
using System.Security.Claims;

namespace LMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Student")]
    public class ProgressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProgressController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("update")]
        public IActionResult UpdateProgress(ProgressUpdateDto dto)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var progress = _context.Progresses
                .FirstOrDefault(p => p.StudentId == studentId && p.CourseId == dto.CourseId);

            double percentage = dto.TotalLessons == 0
                ? 0
                : Math.Round((double)dto.CompletedLessons / dto.TotalLessons * 100, 2);

            if (progress == null)
            {
                progress = new Progress
                {
                    StudentId = studentId,
                    CourseId = dto.CourseId,
                    CompletedLessons = dto.CompletedLessons,
                    TotalLessons = dto.TotalLessons,
                    CompletionPercentage = percentage
                };

                _context.Progresses.Add(progress);
            }
            else
            {
                progress.CompletedLessons = dto.CompletedLessons;
                progress.TotalLessons = dto.TotalLessons;
                progress.CompletionPercentage = percentage;
            }

            _context.SaveChanges();
            return Ok(progress);
        }

        [HttpGet("my")]
        public ActionResult<IEnumerable<Progress>> MyProgress()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var progressList = _context.Progresses
                .Where(p => p.StudentId == studentId)
                .ToList(); // Materialize first

            // Update TotalLessons and Percentage dynamically based on current course structure
            var updatedProgress = progressList.Select(p =>
            {
                var realTotalLessons = _context.Lessons
                    .Include(l => l.Module)
                    .Count(l => l.Module.CourseId == p.CourseId);

                p.TotalLessons = realTotalLessons;
                p.CompletionPercentage = realTotalLessons > 0 
                    ? Math.Round((double)p.CompletedLessons / realTotalLessons * 100, 2)
                    : 0;
                
                return p;
            })
            .OrderByDescending(p => p.CompletionPercentage)
            .ToList();

            return Ok(updatedProgress);
        }
    }
}
