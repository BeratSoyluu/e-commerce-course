using API.Data;
using API.DTO;
using API.Entity;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("/api/admin/orders")]
public class AdminOrdersController : ControllerBase
{
    private readonly DataContext _context;

    public AdminOrdersController(DataContext context)
    {
        _context = context;
    }

    //? OrdersController'dan farkı: CustomerId filtresi yok, tüm müşterilerin siparişleri gelir.
    [HttpGet]
    public async Task<ActionResult<List<OrderDTO>>> GetOrders()
    {
        var orders = await _context.Orders.IncludeItems().OrderByDescending(o => o.Id).ToListAsync();
        return orders.Select(o => o.ToDTO()).ToList();
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<OrderDTO>> UpdateStatus(int id, UpdateOrderStatusDTO model)
    {
        //? Metin olarak gelen durumu enum'a çeviriyoruz; "Shipped" gibi tanımsız değerler veya "5" gibi sayılar reddedilir.
        if (!Enum.TryParse<OrderStatus>(model.Status, ignoreCase: true, out var status)
            || !Enum.IsDefined(status) || int.TryParse(model.Status, out _))
            return BadRequest(new ProblemDetails { Title = $"Geçersiz sipariş durumu: {model.Status}" });

        var order = await _context.Orders.IncludeItems().FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new ProblemDetails { Title = "Sipariş bulunamadı." });

        //! Ödemesi alınamamış sipariş elle "Onaylandı/Tamamlandı" yapılamaz; para tahsil edilmedi ve stok geri verildi.
        if (order.OrderStatus == OrderStatus.PaymentFailed && status != OrderStatus.PaymentFailed)
            return BadRequest(new ProblemDetails { Title = "Ödemesi başarısız olan siparişin durumu değiştirilemez." });

        order.OrderStatus = status;
        await _context.SaveChangesAsync();
        return order.ToDTO();
    }
}
