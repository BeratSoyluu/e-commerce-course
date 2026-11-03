namespace API.Entity;

public class Order
{
    //? Kargo kuralı tek yerde: sipariş oluştururken bu kullanılır, frontend'deki helpers.ts aynı değerleri gösterir.
    public const decimal FreeDeliveryThreshold = 5000;
    public const decimal StandardDeliveryFee = 150;

    public int Id { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow; //! UTC tutuyoruz; gösterirken tarayıcı yerel saate çevirir
    public string CustomerId { get; set; } = null!; //? Kullanıcı adı (e-posta)

    //? Teslimat adresi
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string City { get; set; } = null!;
    public string AddressLine { get; set; } = null!;

    public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;
    public decimal SubTotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public decimal GetTotal() => SubTotal + DeliveryFee;

    public static decimal CalculateDeliveryFee(decimal subTotal) =>
        subTotal >= FreeDeliveryThreshold ? 0 : StandardDeliveryFee;
}

public enum OrderStatus
{
    Pending,
    Approved,
    PaymentFailed,
    Completed
}

//! Ürünle ilişki (navigation) yok, bilgiler kopyalanıyor: ürünün fiyatı/adı sonradan değişse ya da ürün silinse bile
//! eski sipariş, satın alındığı andaki haliyle kalmalı.
public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? ProductImage { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}
