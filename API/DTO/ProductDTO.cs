namespace API.DTO;

//? Frontend'e entity'nin kendisini değil, sadece göstermek istediğimiz alanları dönüyoruz.
//? Entity'ye ileride iç alanlar (maliyet, tedarikçi, ilişkiler) eklense bile API sözleşmesi değişmez.
public class ProductDTO
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public string? ImageUrl { get; set; }
    public int Stock { get; set; }
}
