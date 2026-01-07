using LMS.Api.Models;

namespace LMS.Api.Repositories
{
    public interface ICourseRepository : IRepository<Course>
    {
        Task<IEnumerable<Course>> GetAllWithModulesAsync();
        Task<Course> GetByIdWithContentAsync(int id);
    }
}
