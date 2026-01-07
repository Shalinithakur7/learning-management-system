using Xunit;
using Microsoft.EntityFrameworkCore;
using LMS.Api.Controllers;
using LMS.Api.Data;
using LMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using LMS.Api.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System;

namespace LMS.Api.Tests
{
    public class SubmissionsControllerTests
    {
        private ApplicationDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var databaseContext = new ApplicationDbContext(options);
            databaseContext.Database.EnsureCreated();
            return databaseContext;
        }

        [Fact]
        public void GetSubmissionsByAssignment_ReturnsOk_WithSubmissions()
        {
            // Arrange
            var context = GetDatabaseContext();
            var assignmentId = 1;
            var student = new ApplicationUser { Id = "student1", UserName = "Test Student" };
            context.Users.Add(student);
            context.Submissions.Add(new Submission
            {
                Id = 1,
                AssignmentId = assignmentId,
                StudentId = "student1",
                Content = "Test content",
                SubmittedOn = DateTime.Now,
                Status = "Submitted",
                Student = student
            });
            context.SaveChanges();

            var controller = new SubmissionsController(context);

            // Act
            var result = controller.GetSubmissionsByAssignment(assignmentId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var submissions = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            Assert.Single(submissions);
        }

        [Fact]
        public void GradeSubmission_ReturnsOk_WhenSubmissionExists()
        {
            // Arrange
            var context = GetDatabaseContext();
            var submissionId = 1;
            context.Submissions.Add(new Submission
            {
                Id = submissionId,
                AssignmentId = 1,
                StudentId = "student1",
                Content = "Test content",
                SubmittedOn = DateTime.Now,
                Status = "Submitted"
            });
            context.SaveChanges();

            var controller = new SubmissionsController(context);
            var dto = new GradeSubmissionDto { Grade = 85, Feedback = "Good job" };

            // Act
            var result = controller.GradeSubmission(submissionId, dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var submission = Assert.IsType<Submission>(okResult.Value);
            Assert.Equal(85, submission.Grade);
            Assert.Equal("Graded", submission.Status);
        }

        [Fact]
        public void Submit_ReturnsOk_WhenValidDto()
        {
            // Arrange
            var context = GetDatabaseContext();
            var controller = new SubmissionsController(context);
            
            // Mock User
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "student1"),
                new Claim(ClaimTypes.Role, "Student")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);
            
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            var dto = new SubmissionDto { AssignmentId = 1, Content = "My submission" };

            // Act
            var result = controller.Submit(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var submission = Assert.IsType<Submission>(okResult.Value);
            Assert.Equal("student1", submission.StudentId);
            Assert.Equal("My submission", submission.Content);
        }
    }
}
