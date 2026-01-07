using LMS.Api.Data;
using LMS.Api.DTOs;
using LMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubmissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SubmissionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Student")]
        public IActionResult Submit(SubmissionDto dto)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var submission = new Submission
            {
                AssignmentId = dto.AssignmentId,
                StudentId = studentId,
                Content = dto.Content, // Changed from FilePath to Content
                SubmittedOn = DateTime.Now,
                Status = "Submitted"
            };

            _context.Submissions.Add(submission);
            _context.SaveChanges();

            return Ok(submission);
        }

        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        public IActionResult MySubmissions()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var submissions = _context.Submissions
                .Where(s => s.StudentId == studentId)
                .OrderByDescending(s => s.SubmittedOn)
                .ToList();

            return Ok(submissions);
        }

        // Get submissions for a specific assignment (Instructor)
        [HttpGet("assignment/{assignmentId}")]
        [Authorize(Roles = "Instructor")]
        public IActionResult GetSubmissionsByAssignment(int assignmentId)
        {
            var submissions = _context.Submissions
                .Include(s => s.Student)
                .Where(s => s.AssignmentId == assignmentId)
                .OrderByDescending(s => s.SubmittedOn)
                .Select(s => new
                {
                    s.Id,
                    s.AssignmentId,
                    s.StudentId,
                    StudentName = s.Student.UserName,
                    s.Content,
                    s.SubmittedOn,
                    s.Grade,
                    s.Feedback,
                    s.Status
                })
                .ToList();

            return Ok(submissions);
        }

        // Grade a submission (Instructor)
        [HttpPut("{id}/grade")]
        [Authorize(Roles = "Instructor")]
        public IActionResult GradeSubmission(int id, [FromBody] GradeSubmissionDto dto)
        {
            var submission = _context.Submissions.Find(id);
            if (submission == null)
                return NotFound();

            submission.Grade = dto.Grade;
            submission.Feedback = dto.Feedback;
            submission.Status = "Graded";

            _context.SaveChanges();

            return Ok(submission);
        }
    }
}
