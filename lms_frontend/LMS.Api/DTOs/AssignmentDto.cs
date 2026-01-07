namespace LMS.Api.DTOs
{
    public class AssignmentDto
    {
        public string Title { get; set; }
        public DateTime DueDate { get; set; }
        public int CourseId { get; set; }
    }
}
