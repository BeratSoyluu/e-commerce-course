using API.Entity;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class CartExtensions
{
    //? Sepet her okunduğunda kalemler ve ürün bilgisi de lazım; CartController ve AccountController aynı sorguyu kullanıyor.
    public static IQueryable<Cart> IncludeItems(this IQueryable<Cart> query)
    {
        return query.Include(c => c.CartItems).ThenInclude(i => i.Product);
    }
}
