using LMS.Api.DTOs;
using LMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN,Admin")]
    public class UserManagementController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserManagementController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserManagementDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserManagementDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email ?? "",
                    RequestedRole = user.RequestedRole,
                    CurrentRole = roles.FirstOrDefault() ?? "PENDING",
                    Status = user.Status.ToString(),
                    RejectionReason = user.RejectionReason
                });
            }

            return Ok(userDtos);
        }

        [HttpPut("users/{id}/approve")]
        public async Task<IActionResult> ApproveUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Remove PENDING role
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            // Assign requested role
            var requestedRole = user.RequestedRole ?? "STUDENT";
            await _userManager.AddToRoleAsync(user, requestedRole);

            // Update status to Active and clear RequestedRole (per strict rules)
            user.Status = UserStatus.Active;
            user.RequestedRole = null;  // Clear after approval
            user.RejectionReason = null;
            await _userManager.UpdateAsync(user);

            return Ok(new { message = $"User approved and assigned role: {requestedRole}" });
        }

        [HttpPut("users/{id}/reject")]
        public async Task<IActionResult> RejectUser(string id, [FromBody] RejectUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Delete the user instead of marking as rejected
            var result = await _userManager.DeleteAsync(user);
            
            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to delete user", errors = result.Errors });

            return Ok(new { message = "User rejected and deleted" });
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeUserRole(string id, [FromBody] ChangeRoleDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (user.Status != UserStatus.Active)
                return BadRequest(new { message = "Can only change role for active users" });

            // Remove current roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            // Assign new role
            await _userManager.AddToRoleAsync(user, dto.NewRole);

            return Ok(new { message = $"User role changed to {dto.NewRole}" });
        }

        [HttpPut("users/{id}/block")]
        public async Task<IActionResult> BlockUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.Status = UserStatus.Blocked;
            await _userManager.UpdateAsync(user);

            return Ok(new { message = "User blocked" });
        }

        [HttpPut("users/{id}/unblock")]
        public async Task<IActionResult> UnblockUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.Status = UserStatus.Active;
            await _userManager.UpdateAsync(user);

            return Ok(new { message = "User unblocked" });
        }
    }
}
