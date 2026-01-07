using System.Collections.Generic;
using System.Threading.Tasks;
using LMS.Api.DTOs;
using LMS.Api.Models;

namespace LMS.Api.Services
{
    public interface ICourseService
    {
        Task<IEnumerable<Course>> GetAllCoursesAsync();
        Task<Course> GetCourseByIdAsync(int id);
        Task<Course> CreateCourseAsync(CourseDto courseDto, string instructorId);
        Task<Course> UpdateCourseAsync(int id, CourseDto courseDto);
        Task DeleteCourseAsync(int id);
        Task<Module> AddModuleAsync(int courseId, ModuleDto moduleDto);
        Task<Lesson> AddLessonAsync(int moduleId, LessonDto lessonDto);
        Task<Lesson> AddLessonWithVideoAsync(int moduleId, LessonUploadDto lessonDto);
        Task DeleteModuleAsync(int moduleId);

        Task DeleteLessonAsync(int lessonId);
        Task<IEnumerable<Course>> GetCoursesByInstructorAsync(string instructorId);
        Task<IEnumerable<Course>> GetInstructorCoursesAsync(string instructorId);
        Task<Course> PublishCourseAsync(int courseId);
        Task SubmitForApprovalAsync(int courseId);
        Task ApproveCourseAsync(int courseId);
        Task RejectCourseAsync(int courseId, string reason);
        Task<AdminStatsDto> GetAdminStatsAsync();
    }
}
