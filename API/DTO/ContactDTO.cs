using System.ComponentModel.DataAnnotations;

namespace API.DTO;

//! Form herkese açık (giriş gerektirmiyor); uzunluk sınırları veritabanının kötüye kullanımla şişmesini sınırlar.
public class CreateContactMessageDTO
{
    [Required(ErrorMessage = "Ad soyad zorunlu.")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "E-posta zorunlu.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta girin.")]
    [StringLength(150)]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Konu zorunlu.")]
    [StringLength(150)]
    public string Subject { get; set; } = null!;

    [Required(ErrorMessage = "Mesaj zorunlu.")]
    [StringLength(2000, MinimumLength = 10, ErrorMessage = "Mesaj 10-2000 karakter arasında olmalı.")]
    public string Message { get; set; } = null!;
}

public class ContactMessageDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
