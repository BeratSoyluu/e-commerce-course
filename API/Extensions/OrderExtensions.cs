using API.DTO;
using API.Entity;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class OrderExtensions
{
    public static IQueryable<Order> IncludeItems(this IQueryable<Order> query)
    {
        return query.Include(o => o.OrderItems);
    }

    public static OrderDTO ToDTO(this Order order)
    {
        return new OrderDTO
        {
            Id = order.Id,
            //! SQLite tarihi saat dilimi bilgisi olmadan saklıyor; okununca Kind=Unspecified oluyor ve JSON'a "Z" eklenmiyor.
            //! Tarayıcı onu yerel saat sanar ve 3 saat kayar. UTC olduğunu açıkça işaretliyoruz.
            OrderDate = DateTime.SpecifyKind(order.OrderDate, DateTimeKind.Utc),
            FirstName = order.FirstName,
            LastName = order.LastName,
            Phone = order.Phone,
            City = order.City,
            AddressLine = order.AddressLine,
            OrderStatus = order.OrderStatus.ToString(),
            SubTotal = order.SubTotal,
            DeliveryFee = order.DeliveryFee,
            Total = order.GetTotal(),
            OrderItems = order.OrderItems.Select(item => new OrderItemDTO
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                ProductImage = item.ProductImage,
                Price = item.Price,
                Quantity = item.Quantity
            }).ToList()
        };
    }
}
