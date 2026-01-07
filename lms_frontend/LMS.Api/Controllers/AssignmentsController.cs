using LMS.Api.Data;
using LMS.Api.DTOs;
using LMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Instructor")]
    public class AssignmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AssignmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult Create(AssignmentDto dto)
        {
            var assignment = new Assignment
            {
                Title = dto.Title,
                DueDate = dto.DueDate,
                CourseId = dto.CourseId
            };

            _context.Assignments.Add(assignment);
            _context.SaveChanges();

            return Ok(assignment);
        }

        [HttpGet("{courseId}")]
        [AllowAnonymous] // Allow students to view assignments for courses they're enrolled in
        public IActionResult GetByCourse(int courseId)
        {
            var assignments = _context.Assignments
                .Where(a => a.CourseId == courseId)
                .OrderBy(a => a.Title.ToLower())
                .ToList();

            return Ok(assignments);
        }

        [HttpGet("my")]
        public IActionResult GetMyAssignments()
        {
            var instructorId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            var assignments = _context.Assignments
                .Where(a => _context.Courses.Any(c => c.Id == a.CourseId && c.InstructorId == instructorId))
                .OrderBy(a => a.Title)
                .ToList();

            return Ok(assignments);
        }
    }
}
