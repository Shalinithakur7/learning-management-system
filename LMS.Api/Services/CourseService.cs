using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LMS.Api.DTOs;
using LMS.Api.Models;
using LMS.Api.Repositories;

namespace LMS.Api.Services
{
    public class CourseService : ICourseService
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IRepository<Module> _moduleRepository;
        private readonly IRepository<Lesson> _lessonRepository;

        public CourseService(ICourseRepository courseRepository, 
            IRepository<Module> moduleRepository, 
            IRepository<Lesson> lessonRepository)
        {
            _courseRepository = courseRepository;
            _moduleRepository = moduleRepository;
            _lessonRepository = lessonRepository;
        }

        public async Task<IEnumerable<Course>> GetAllCoursesAsync()
        {
            return await _courseRepository.GetAllWithModulesAsync();
        }

        public async Task<Course> GetCourseByIdAsync(int id)
        {
            return await _courseRepository.GetByIdWithContentAsync(id);
        }

        public async Task<Course> CreateCourseAsync(CourseDto courseDto, string instructorId)
        {
            var course = new Course
            {
                Title = courseDto.Title,
                Description = courseDto.Description,
                Price = courseDto.Price,
                InstructorId = instructorId,
                IsPublished = false
            };

            await _courseRepository.AddAsync(course);
            return course;
        }

        public async Task<Course> UpdateCourseAsync(int id, CourseDto courseDto)
        {
            var course = await _courseRepository.GetByIdAsync(id);
            if (course == null) return null;

            course.Title = courseDto.Title;
            course.Description = courseDto.Description;
            course.Price = courseDto.Price;
            
            await _courseRepository.UpdateAsync(course);
            return course;
        }

        public async Task DeleteCourseAsync(int id)
        {
            await _courseRepository.DeleteAsync(id);
        }

        public async Task<Module> AddModuleAsync(int courseId, ModuleDto moduleDto)
        {
            var module = new Module
            {
                Title = moduleDto.Title,
                CourseId = courseId
            };
            await _moduleRepository.AddAsync(module);
            return module;
        }

        public async Task<Lesson> AddLessonAsync(int moduleId, LessonDto lessonDto)
        {
            var lesson = new Lesson
            {
                Title = lessonDto.Title,
                Content = lessonDto.Content,
                VideoUrl = lessonDto.VideoUrl,
                ModuleId = moduleId
            };
            await _lessonRepository.AddAsync(lesson);
            return lesson;
        }

        public async Task<Lesson> AddLessonWithVideoAsync(int moduleId, LessonUploadDto lessonDto)
        {
            string videoUrl = "";

            if (lessonDto.VideoFile != null && lessonDto.VideoFile.Length > 0)
            {
                // Ensure directory exists
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Unique filename
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + lessonDto.VideoFile.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await lessonDto.VideoFile.CopyToAsync(fileStream);
                }

                videoUrl = $"/uploads/{uniqueFileName}";
            }

            var lesson = new Lesson
            {
                Title = lessonDto.Title,
                Content = lessonDto.Content,
                VideoUrl = videoUrl,
                ModuleId = moduleId
            };

            await _lessonRepository.AddAsync(lesson);
            return lesson;
        }
        public async Task DeleteModuleAsync(int moduleId)
        {
            await _moduleRepository.DeleteAsync(moduleId);
        }

        public async Task DeleteLessonAsync(int lessonId)
        {
            await _lessonRepository.DeleteAsync(lessonId);
        }
        
        public async Task<Course> PublishCourseAsync(int courseId)
        {
            var course = await _courseRepository.GetByIdAsync(courseId);
            if (course == null) return null;

            course.IsPublished = true;
            await _courseRepository.UpdateAsync(course);
            return course;
        }

        public async Task SubmitForApprovalAsync(int courseId)
        {
            var course = await _courseRepository.GetByIdAsync(courseId);
            if (course == null) throw new Exception("Course not found");

            course.Status = CourseStatus.Pending;
            course.IsPublished = false; // Ensure it is not visible to students while pending
            course.SubmittedAt = DateTime.UtcNow;
            course.RejectionReason = null; // Clear any previous rejection reason
            await _courseRepository.UpdateAsync(course);
        }

        public async Task ApproveCourseAsync(int courseId)
        {
            var course = await _courseRepository.GetByIdAsync(courseId);
            if (course == null) throw new Exception("Course not found");

            course.Status = CourseStatus.Approved;
            course.IsPublished = true;
            course.ApprovedAt = DateTime.UtcNow;
            await _courseRepository.UpdateAsync(course);
        }

        public async Task RejectCourseAsync(int courseId, string reason)
        {
            var course = await _courseRepository.GetByIdAsync(courseId);
            if (course == null) throw new Exception("Course not found");

            course.Status = CourseStatus.Rejected;
            course.RejectionReason = reason;
            await _courseRepository.UpdateAsync(course);
        }

        public async Task<IEnumerable<Course>> GetCoursesByInstructorAsync(string instructorId)
        {
            return await _courseRepository.FindAsync(c => c.InstructorId == instructorId);
        }

        public async Task<IEnumerable<Course>> GetInstructorCoursesAsync(string instructorId)
        {
            return await _courseRepository.FindAsync(c => c.InstructorId == instructorId);
        }

        public async Task<AdminStatsDto> GetAdminStatsAsync()
        {
            // For production, use CountAsync or optimized queries. For now, fetch all metadata.
            var allCourses = await _courseRepository.GetAllAsync();
            
            return new AdminStatsDto
            {
                TotalCourses = allCourses.Count(),
                ActiveCourses = allCourses.Count(c => c.Status == CourseStatus.Approved),
                PendingApprovals = allCourses.Count(c => c.Status == CourseStatus.Pending),
                TotalUsers = 0, // Placeholder
                TotalInstructors = 0, // Placeholder
                TotalStudents = 0 // Placeholder
            };
        }
    }
}
