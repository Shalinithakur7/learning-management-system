using LMS.Api.DTOs;
using Microsoft.AspNetCore.Identity;

namespace LMS.Api.Services
{
    public interface IAuthService
    {
        Task<IdentityResult> RegisterAsync(RegisterDto registerDto);
        Task<string> LoginAsync(LoginDto loginDto);
    }
}
