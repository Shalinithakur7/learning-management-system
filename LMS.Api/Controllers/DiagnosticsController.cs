using LMS.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DiagnosticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("check-instructor")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> CheckInstructor()
        {
            var instructorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var instructorName = User.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            var allCourses = await _context.Courses.ToListAsync();
            var myCourses = await _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .ToListAsync();

            return Ok(new
            {
                CurrentUser = new
                {
                    InstructorId = instructorId,
                    InstructorName = instructorName,
                    Roles = roles
                },
                Database = new
                {
                    TotalCourses = allCourses.Count,
                    AllCourses = allCourses.Select(c => new
                    {
                        c.Id,
                        c.Title,
                        c.InstructorId
                    }),
                    MyCoursesCount = myCourses.Count,
                    MyCourses = myCourses.Select(c => new
                    {
                        c.Id,
                        c.Title,
                        c.InstructorId
                    })
                }
            });
        }
    }
}
