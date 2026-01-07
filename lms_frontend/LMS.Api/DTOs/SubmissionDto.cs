namespace LMS.Api.DTOs
{
    public class SubmissionDto
    {
        public int AssignmentId { get; set; }
        public string Content { get; set; } // Changed from FilePath to Content
    }
}
