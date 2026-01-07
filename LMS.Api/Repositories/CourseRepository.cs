using LMS.Api.Data;
using LMS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LMS.Api.Repositories
{
    public class CourseRepository : Repository<Course>, ICourseRepository
    {
        public CourseRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Course>> GetAllWithModulesAsync()
        {
            return await _context.Courses
                .Include(c => c.Modules)
                .ToListAsync();
        }

        public async Task<Course> GetByIdWithContentAsync(int id)
        {
            return await _context.Courses
                .Include(c => c.Modules)
                .ThenInclude(m => m.Lessons)
                .FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}
