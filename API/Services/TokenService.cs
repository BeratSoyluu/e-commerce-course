using System.Security.Claims;
using System.Text;
using API.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService
{
    //? Program.cs'teki JwtBearer doğrulaması da bu isimleri kullanıyor (NameClaimType / RoleClaimType).
    public const string RoleClaim = "role";

    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _config;

    public TokenService(UserManager<AppUser> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    public async Task<string> GenerateToken(AppUser user)
    {
        //? Standart kısa claim isimleri: sub = id, unique_name = kullanıcı adı (User.Identity.Name olur), name = ad soyad.
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName!),
            new(JwtRegisteredClaimNames.Name, user.Name ?? ""),
        };

        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(RoleClaim, role)));

        //! Token sadece imzalanır, şifrelenmez: içindeki claim'leri herkes okuyabilir. Buraya gizli bilgi konmaz.
        //! İmza anahtarı sızarsa herkes istediği rolle token üretebilir; bu yüzden anahtar repoda değil user-secrets'ta.
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWTSecurityKey"]!));

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }
}
