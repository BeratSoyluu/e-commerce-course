using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class OrderDTO
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string City { get; set; } = null!;
    public string AddressLine { get; set; } = null!;
    public string OrderStatus { get; set; } = null!; //? Enum metin olarak dönüyor ("Approved"), frontend'de okunur
    public decimal SubTotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal Total { get; set; }
    public List<OrderItemDTO> OrderItems { get; set; } = new List<OrderItemDTO>();
}

public class OrderItemDTO
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? ProductImage { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

//? Sipariş oluştururken istemciden sadece adres alınıyor. Ürünler, fiyatlar ve toplam sunucuda sepetten hesaplanır.
//! İstemcinin gönderdiği fiyata asla güvenilmez; aksi halde biri isteği değiştirip 1 ₺'ye saat alabilirdi.
public class CreateOrderDTO
{
    [Required(ErrorMessage = "Ad zorunlu.")]
    [StringLength(50)]
    public string FirstName { get; set; } = null!;

    [Required(ErrorMessage = "Soyad zorunlu.")]
    [StringLength(50)]
    public string LastName { get; set; } = null!;

    [Required(ErrorMessage = "Telefon zorunlu.")]
    [RegularExpression(@"^0?5\d{9}$", ErrorMessage = "Telefon 05XXXXXXXXX biçiminde olmalı.")]
    public string Phone { get; set; } = null!;

    [Required(ErrorMessage = "Şehir zorunlu.")]
    [StringLength(50)]
    public string City { get; set; } = null!;

    [Required(ErrorMessage = "Adres zorunlu.")]
    [StringLength(250, MinimumLength = 10, ErrorMessage = "Adres en az 10 karakter olmalı.")]
    public string AddressLine { get; set; } = null!;

    [Required(ErrorMessage = "Kart bilgileri zorunlu.")]
    public CardDTO Card { get; set; } = null!;
}

//! Kart bilgisi sadece bu istek boyunca bellekte yaşar: iyzico'ya iletilir, Order entity'sinde karşılığı yok,
//! veritabanına yazılmaz ve hiçbir log satırına eklenmez. Hata mesajları da değeri değil alan adını içerir.
public class CardDTO
{
    [Required(ErrorMessage = "Kart üzerindeki isim zorunlu.")]
    [StringLength(100)]
    public string CardHolderName { get; set; } = null!;

    [Required(ErrorMessage = "Kart numarası zorunlu.")]
    [RegularExpression(@"^\d{15,16}$", ErrorMessage = "Kart numarası 15-16 haneli olmalı.")]
    public string CardNumber { get; set; } = null!;

    [Required(ErrorMessage = "Son kullanma ayı zorunlu.")]
    [RegularExpression(@"^(0[1-9]|1[0-2])$", ErrorMessage = "Ay 01-12 arasında olmalı.")]
    public string ExpireMonth { get; set; } = null!;

    [Required(ErrorMessage = "Son kullanma yılı zorunlu.")]
    [RegularExpression(@"^20\d{2}$", ErrorMessage = "Yıl 4 haneli olmalı (ör. 2030).")]
    public string ExpireYear { get; set; } = null!;

    [Required(ErrorMessage = "CVC zorunlu.")]
    [RegularExpression(@"^\d{3,4}$", ErrorMessage = "CVC 3-4 haneli olmalı.")]
    public string Cvc { get; set; } = null!;
}
