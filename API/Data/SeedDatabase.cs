using API.Entity;
using Microsoft.AspNetCore.Identity;

namespace API.Data;

public static class SeedDatabase
{
    //? Roller ve admin kullanıcısı HasData ile değil burada ekleniyor: şifrenin hash'lenmesi için UserManager gerekiyor.
    //? Metot idempotent: her açılışta çalışır ama sadece eksik olanı ekler.
    public static async Task Initialize(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<WebApplication>>();

        foreach (var role in new[] { "Admin", "Customer" })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        //! Admin bilgileri koddan değil config'ten geliyor (Development'ta appsettings.Development.json).
        //! Production'da tanımlı değilse bilinen şifreli bir admin hiç oluşturulmaz.
        var email = app.Configuration["SeedAdmin:Email"];
        var password = app.Configuration["SeedAdmin:Password"];
        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
        {
            logger.LogInformation("SeedAdmin ayarı yok, admin kullanıcısı oluşturulmadı.");
            return;
        }

        if (await userManager.FindByEmailAsync(email) != null) return;

        var admin = new AppUser { Name = "Admin", UserName = email, Email = email };
        var result = await userManager.CreateAsync(admin, password);
        if (!result.Succeeded)
        {
            logger.LogError("Admin oluşturulamadı: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
            return;
        }
        await userManager.AddToRolesAsync(admin, ["Admin", "Customer"]);
    }
}
