using System.ComponentModel.DataAnnotations;

namespace API.DTO;

//? [ApiController] bu kurallara uymayan istekleri controller'a girmeden 400 (ValidationProblem) ile reddeder.
public class LoginDTO
{
    [Required(ErrorMessage = "E-posta zorunlu.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta girin.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Şifre zorunlu.")]
    public string Password { get; set; } = null!;
}

public class RegisterDTO
{
    [Required(ErrorMessage = "Ad soyad zorunlu.")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "E-posta zorunlu.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta girin.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Şifre zorunlu.")]
    public string Password { get; set; } = null!;
}

//! Şifre hash'i, güvenlik damgası gibi Identity alanları asla dışarı çıkmaz; sadece frontend'in ihtiyacı olanlar.
public class UserDTO
{
    public string? Name { get; set; }
    public string Email { get; set; } = null!;
    public string Token { get; set; } = null!;
    public IList<string> Roles { get; set; } = [];
}
