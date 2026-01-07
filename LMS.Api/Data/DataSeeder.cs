using LMS.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace LMS.Api.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Create all required roles including PENDING
            string[] roleNames = { "ADMIN", "INSTRUCTOR", "STUDENT", "PENDING" };

            foreach (var role in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            // Create default admin user with Active status
            var existingAdmin = await userManager.FindByEmailAsync("admin@lms.com");
            if (existingAdmin == null)
            {
                var admin = new ApplicationUser
                {
                    UserName = "admin@lms.com",
                    Email = "admin@lms.com",
                    FullName = "System Admin",
                    Status = UserStatus.Active  // Admin is Active by default
                };

                await userManager.CreateAsync(admin, "Admin@123");
                await userManager.AddToRoleAsync(admin, "ADMIN");
            }
            else
            {
                // Update existing admin to Active status if not already
                if (existingAdmin.Status != UserStatus.Active)
                {
                    existingAdmin.Status = UserStatus.Active;
                    await userManager.UpdateAsync(existingAdmin);
                }
                
                // Fix role: Remove old lowercase/mixed-case roles and ensure ADMIN role
                var currentRoles = await userManager.GetRolesAsync(existingAdmin);
                
                // Remove any old admin roles (Admin, admin, etc.)
                var oldAdminRoles = currentRoles.Where(r => r.ToUpper() == "ADMIN" && r != "ADMIN").ToList();
                if (oldAdminRoles.Any())
                {
                    await userManager.RemoveFromRolesAsync(existingAdmin, oldAdminRoles);
                }
                
                // Also remove the exact "Admin" role if it exists
                if (currentRoles.Contains("Admin"))
                {
                    await userManager.RemoveFromRoleAsync(existingAdmin, "Admin");
                }
                
                // Ensure ADMIN role (uppercase)
                if (!currentRoles.Contains("ADMIN"))
                {
                    await userManager.AddToRoleAsync(existingAdmin, "ADMIN");
                }
            }
        }
    }
}
