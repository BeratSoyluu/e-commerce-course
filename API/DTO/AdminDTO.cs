using System.ComponentModel.DataAnnotations;

namespace API.DTO;

//? [FromForm] ile multipart/form-data olarak gelir: metin alanları + görsel dosyası aynı istekte.
public class ProductFormDTO
{
    [Required(ErrorMessage = "Ürün adı zorunlu.")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string? Brand { get; set; }

    [Range(0.01, 10_000_000, ErrorMessage = "Fiyat 0'dan büyük olmalı.")]
    public decimal Price { get; set; }

    [Range(0, 100_000, ErrorMessage = "Stok 0 veya daha büyük olmalı.")]
    public int Stock { get; set; }

    public bool IsActive { get; set; } = true;

    //? Eklerken zorunlu, güncellerken opsiyonel (gönderilmezse eski görsel kalır); kontrol controller'da.
    public IFormFile? Image { get; set; }
}

public class UpdateOrderStatusDTO
{
    [Required(ErrorMessage = "Durum zorunlu.")]
    public string Status { get; set; } = null!;
}
