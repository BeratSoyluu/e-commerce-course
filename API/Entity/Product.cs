using System.ComponentModel.DataAnnotations;

namespace API.Entity;

public class Product
{
    public int Id { get; set; }

    [Required] // biri ürün oluştururken Name göndermezse, kod veritabanına gitmeden önce daha kapıda "olmaz" der.
    public string? Name { get; set; } // "bu boş kalabilir" demek istediğinde ? eklemen gerekir.
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public string? ImageUrl { get; set; }
    public int Stock { get; set; }

}