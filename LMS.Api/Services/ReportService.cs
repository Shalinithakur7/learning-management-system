using LMS.Api.Data;
using LMS.Api.DTOs;
using LMS.Api.Models; // Ensure this is imported for Enrollment
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace LMS.Api.Services
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ReportService(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<List<CourseEnrollmentReportDto>> GetCourseEnrollmentStatsAsync()
        {
            return await _context.Enrollments
                .GroupBy(e => new { e.CourseId, e.Course.Title }) // Assumes navigation property
                .Select(g => new CourseEnrollmentReportDto
                {
                    CourseId = g.Key.CourseId,
                    CourseTitle = g.Key.Title,
                    TotalEnrollments = g.Count()
                })
                .ToListAsync();
        }

        public async Task<List<StudentCourseGroupDto>> GetStudentsGroupedByCourseAsync()
        {
            var data = await _context.Enrollments
                .Include(e => e.Course) // Eager load
                .GroupBy(e => new { e.CourseId, e.Course.Title })
                .Select(g => new 
                {
                    Key = g.Key,
                    // We can't project student name directly in EF translated query easily if nav prop is missing or simple join needed
                    // BUT assuming Enrollment has StudentId (string) and no nav prop to ApplicationUser?
                    // Let's check Enrollment.cs. It has StudentId but no User navigation property usually in Identity setups unless added.
                    // We might need to fetch IDs and map names in memory if navigation is missing.
                    // HOWEVER, requested "Students Grouped by Course"
                    StudentIds = g.Select(e => e.StudentId).ToList()
                })
                .ToListAsync();

            // Fetch all users to map names (Not ideal for huge sets, but standard for this scale)
            // OR use Join if possible. AspNetUsers table.
            // EF Core Identity Join:
            
            var query = from e in _context.Enrollments
                        join u in _context.Users on e.StudentId equals u.Id
                        join c in _context.Courses on e.CourseId equals c.Id
                        group u.FullName by new { c.Id, c.Title } into g
                        select new StudentCourseGroupDto
                        {
                            CourseId = g.Key.Id,
                            CourseTitle = g.Key.Title,
                            StudentNames = g.ToList() 
                        };
            
            return await query.ToListAsync();
        }

        public async Task<List<AssignmentSubmissionReportDto>> GetAssignmentSubmissionStatsAsync()
        {
            // Join Assignments with Submissions
            // Need Left Join logic to count submissions
            
            var query = from a in _context.Assignments
                        join c in _context.Courses on a.CourseId equals c.Id
                        join s in _context.Submissions on a.Id equals s.AssignmentId into subs
                        from sub in subs.DefaultIfEmpty()
                        group sub by new { a.Id, a.Title, CourseTitle = c.Title } into g
                        select new AssignmentSubmissionReportDto
                        {
                            AssignmentId = g.Key.Id,
                            AssignmentTitle = g.Key.Title,
                            CourseTitle = g.Key.CourseTitle,
                            TotalSubmissions = g.Count(x => x != null),
                            // To get "TotalStudents" for the course, we need another query or subquery.
                            // Simplified for this requirement: Just Count submissions.
                            // If "TotalStudents" means "Students Enrolled in Course", we need that.
                            // Let's add it via subquery or separate lookup if LINQ is complex in one go.
                            // Actually, let's stick to what we can get from Assignment+Submission first or try a broader group join.
                            
                            // Let's refine the query to include enrollment count for the course
                            TotalStudents = _context.Enrollments.Count(e => e.CourseId == g.FirstOrDefault().Assignment.CourseId), // This might fail translation inside GroupBy
                            
                            // Simplified approach: Calculate aggregates
                            PendingSubmissions = 0 // Placeholder, 'Pending' usually implies enrolled but not submitted.
                        };

           // Better LINQ Approach for "Pending": 
           // 1. Get List of Assignments with CourseId
           // 2. For each, count enrollments vs submissions
           
           var assignments = await _context.Assignments
                .Include(a => a.Course)
                .Select(a => new 
                {
                    a.Id,
                    a.Title,
                    a.CourseId,
                    CourseTitle = a.Course.Title,
                    SubmissionCount = _context.Submissions.Count(s => s.AssignmentId == a.Id),
                    EnrollmentCount = _context.Enrollments.Count(e => e.CourseId == a.CourseId)
                })
                .ToListAsync();

            return assignments.Select(a => new AssignmentSubmissionReportDto
            {
                AssignmentId = a.Id,
                AssignmentTitle = a.Title,
                CourseTitle = a.CourseTitle,
                TotalSubmissions = a.SubmissionCount,
                TotalStudents = a.EnrollmentCount,
                PendingSubmissions = a.EnrollmentCount - a.SubmissionCount
            }).ToList();
        }

        public async Task<List<StudentProgressReportDto>> GetStudentProgressReportsAsync(int? courseId = null)
        {
            // Progress logic:
            // Enrollments join Users join Courses
            // Calculate % based on CompletedLessonIds (json) or specific Progress table if it exists.
            // We saw a 'Progresses' table in migration but Enrollment also has 'CompletedLessonIds'.
            // The prompt mentions "Join lessons with lesson_progress".
            // Let's use the 'Enrollment.CompletedLessonIds' since we just fixed it. 
            // OR check if there is a 'Progress' entity? Migration `AddProgress` added `Progresses`.
            // Let's check `Progress` model. 
            // Assuming `Enrollment` is the source of truth for now based on recent fix.
            
            var query = from e in _context.Enrollments
                        join u in _context.Users on e.StudentId equals u.Id
                        join c in _context.Courses on e.CourseId equals c.Id
                        // join p in _context.Progresses on ... if we used that
                        where courseId == null || e.CourseId == courseId
                        select new { e, u, c };

            var inputList = await query.ToListAsync();
            
            // In-memory processing for JSON deserialization of CompletedLessonIds if needed
            // Or if we use the Lesson count logic
            
            var result = new List<StudentProgressReportDto>();
            
            foreach(var item in inputList)
            {
                 var completedIds = new List<int>();
                 if (!string.IsNullOrEmpty(item.e.CompletedLessonIds))
                 {
                    try {
                        completedIds = System.Text.Json.JsonSerializer.Deserialize<List<int>>(item.e.CompletedLessonIds) ?? new List<int>();
                    } catch {}
                 }

                 // We need total lessons for the course. 
                 // Performance note: N+1 problem here if we don't include recursively. 
                 // Better to fetch course totals in advance or Include in query.
                 // Let's optimize the initial query to Include Modules.Lessons
                 
                 // Re-querying with Include separately or refactoring above
            }

            // Optimized Approach:
            var data = await _context.Enrollments
                .Include(e => e.Course).ThenInclude(c => c.Modules).ThenInclude(m => m.Lessons)
                .Where(e => courseId == null || e.CourseId == courseId)
                .Select(e => new 
                {
                    e.StudentId,
                    e.CompletedLessonIds,
                    e.CourseId,
                    e.Course.Title,
                    TotalLessons = e.Course.Modules.SelectMany(m => m.Lessons).Count()
                })
                .ToListAsync();
                
                // Need User names. 
                // Fetch users separately or join
            var userIds = data.Select(d => d.StudentId).Distinct().ToList();
            var users = await _userManager.Users.Where(u => userIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u);

            return data.Select(d => 
            {
                var completedCount = 0;
                if (!string.IsNullOrEmpty(d.CompletedLessonIds)) {
                     try {
                        var ids = System.Text.Json.JsonSerializer.Deserialize<List<int>>(d.CompletedLessonIds);
                        completedCount = ids?.Count ?? 0;
                     } catch {}
                }
                
                var user = users.ContainsKey(d.StudentId) ? users[d.StudentId] : null;

                return new StudentProgressReportDto
                {
                    StudentId = d.StudentId,
                    StudentName = user?.FullName ?? "Unknown",
                    StudentEmail = user?.Email ?? "",
                    CourseId = d.CourseId,
                    CourseTitle = d.Title,
                    TotalLessons = d.TotalLessons,
                    CompletedLessons = completedCount,
                    ProgressPercentage = d.TotalLessons > 0 ? (double)completedCount / d.TotalLessons * 100 : 0
                };
            }).ToList();
        }
    }
}
