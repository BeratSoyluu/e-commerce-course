using API.Data;
using API.DTO;
using API.Entity;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

//? Controller seviyesinde [Authorize]: tüm action'lar giriş ister. Sipariş anonim sepet gibi cookie ile verilmiyor.
[Authorize]
[ApiController]
[Route("/api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly DataContext _context;

    public OrdersController(DataContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDTO>>> GetOrders()
    {
        var orders = await _context.Orders
            .IncludeItems()
            .Where(o => o.CustomerId == User.Identity!.Name)
            .OrderByDescending(o => o.Id) //? En yeni sipariş en üstte (Id artan olduğu için tarihle aynı sıra)
            .ToListAsync();

        return orders.Select(o => o.ToDTO()).ToList();
    }

    [HttpGet("{id}", Name = "GetOrder")]
    public async Task<ActionResult<OrderDTO>> GetOrder(int id)
    {
        //! CustomerId filtresi şart: yoksa giriş yapmış herkes id'yi değiştirerek başkasının siparişini (adresini) görebilirdi.
        var order = await _context.Orders
            .IncludeItems()
            .FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == User.Identity!.Name);

        if(order == null) return NotFound(new ProblemDetails{Title = "Sipariş bulunamadı."});

        return order.ToDTO();
    }

    [HttpPost]
    public async Task<ActionResult<OrderDTO>> CreateOrder(CreateOrderDTO model)
    {
        var userName = User.Identity!.Name!;

        //! Stok kontrolü, stoktan düşme, sipariş kaydı ve sepetin silinmesi ya hep birlikte olur ya hiç olmaz.
        //! SQLite'ta BeginTransaction "BEGIN IMMEDIATE" çalıştırır: yazma kilidi baştan alınır, aynı anda gelen iki sipariş
        //! aynı stoğu okuyup ikisi birden satamaz; ikinci istek ilki bitene kadar bekler.
        await using var transaction = await _context.Database.BeginTransactionAsync();

        //? Sepet transaction içinde okunuyor ki stok değerleri kilit alındıktan sonraki güncel değerler olsun
        var cart = await _context.Carts.IncludeItems().FirstOrDefaultAsync(c => c.CustomerId == userName);
        if(cart == null || cart.CartItems.Count == 0)
            return BadRequest(new ProblemDetails{Title = "Sepetiniz boş."});

        var orderItems = new List<OrderItem>();
        foreach(var item in cart.CartItems)
        {
            var product = item.Product;

            if(!product.IsActive)
                return BadRequest(new ProblemDetails{Title = $"'{product.Name}' artık satışta değil, sepetten çıkarın."});

            if(product.Stock < item.Quantity)
                return BadRequest(new ProblemDetails{Title = $"'{product.Name}' için stokta {product.Stock} adet var, sepetinizde {item.Quantity} adet."});
            //? Erken return'lerde transaction commit edilmeden dispose olur = rollback. Henüz hiçbir şey kaydedilmedi zaten.

            product.Stock -= item.Quantity;

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name!,
                ProductImage = product.ImageUrl,
                Price = product.Price, //? Fiyat sunucudaki üründen alınıyor, istemciden değil
                Quantity = item.Quantity
            });
        }

        var subTotal = orderItems.Sum(i => i.Price * i.Quantity);
        var order = new Order
        {
            CustomerId = userName,
            FirstName = model.FirstName,
            LastName = model.LastName,
            Phone = model.Phone,
            City = model.City,
            AddressLine = model.AddressLine,
            SubTotal = subTotal,
            DeliveryFee = Order.CalculateDeliveryFee(subTotal),
            OrderItems = orderItems
        };

        _context.Orders.Add(order);
        _context.Carts.Remove(cart); //? Sipariş verildi, sepet boşalır (kalemler cascade ile silinir)

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return CreatedAtRoute("GetOrder", new { id = order.Id }, order.ToDTO());
    }
}
