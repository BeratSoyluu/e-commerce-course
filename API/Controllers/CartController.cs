using API.Data;
using API.DTO;
using API.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class CartController : ControllerBase
{
    private readonly DataContext _context;
    private readonly IHostEnvironment _env;
    public CartController(DataContext context, IHostEnvironment env)
    {
        _context = context;
        _env = env; //? Cookie'nin Secure ayarı ortama göre değişeceği için gerekli
    }

    [HttpGet]
    public async Task<ActionResult<CartDTO>> GetCart()
    {
        var cart = await GetOrCreate();
        return CartToDTO(cart);
    }

    [HttpPost]
    public async Task<ActionResult<CartDTO>> AddItemToCart(int productId, int quantity)
    {
        //? Önce isteğin kendisini doğruluyoruz. Geçersiz istek için veritabanına gitmeye ve sepet/cookie oluşturmaya gerek yok.
        if(quantity <= 0)
            return BadRequest(new ProblemDetails{Title = "Adet 0'dan büyük olmalıdır."});

        var product = await _context.Products.FirstOrDefaultAsync(i => i.Id == productId);

        //? Frontend'deki interceptor toast'ta data.title'ı gösteriyor, düz string dönersek title boş gelir.
        if(product == null)
            return NotFound(new ProblemDetails{Title = "Ürün bulunamadı."});

        if(!product.IsActive)
            return BadRequest(new ProblemDetails{Title = "Bu ürün şu an satışta değil."});

        var cart = await GetOrCreate();

        //! Stok kontrolü sepette zaten olan adedi de hesaba katmalı, yoksa 1'er 1'er ekleyerek stok aşılabilir.
        var quantityInCart = cart.CartItems.FirstOrDefault(i => i.ProductId == productId)?.Quantity ?? 0;
        if(quantityInCart + quantity > product.Stock)
        {
            return BadRequest(new ProblemDetails
            {
                Title = $"Yetersiz stok: stokta {product.Stock} adet var, sepetinizde zaten {quantityInCart} adet bulunuyor.",
                Detail = $"En fazla {Math.Max(product.Stock - quantityInCart, 0)} adet daha ekleyebilirsiniz."
            });
        }

        cart.AddItem(product,quantity);
        var result = await _context.SaveChangesAsync() > 0;
        if(result)
            return CreatedAtAction(nameof(GetCart),CartToDTO(cart));
        
        return BadRequest(new ProblemDetails{Title = "The product can not be added to cart"});
    }

    [HttpDelete]
    public async Task<ActionResult<CartDTO>> DeleteItemFromCart(int productId, int quantity)
    {
        if(quantity <= 0)
            return BadRequest(new ProblemDetails{Title = "Adet 0'dan büyük olmalıdır."});

        var cart = await GetOrCreate();

        cart.DeleteItem(productId,quantity);

        var result = await _context.SaveChangesAsync() > 0;
        //? Güncel sepeti dönüyoruz ki frontend kendi hesaplamasına değil, sunucunun gerçek durumuna güvensin.
        if(result)    return Ok(CartToDTO(cart));
        return BadRequest(new ProblemDetails{Title="Problem removing item from the cart"});
    }


    private async Task<Cart> GetOrCreate()
    {
        var cart = await _context.Carts
        .Include(i => i.CartItems)
        .ThenInclude(i => i.Product)
        .Where(i => i.CustomerId == Request.Cookies["customerId"])
        .FirstOrDefaultAsync();

        if(cart == null)
        {
            var customerId = Guid.NewGuid().ToString();

            var cookieOptions = new CookieOptions
            {
                Expires = DateTime.Now.AddMonths(1),
                IsEssential = true,
                //? HttpOnly: JavaScript (document.cookie) bu cookie'yi okuyamaz. XSS açığı olsa bile sepet kimliği çalınamaz.
                //? Tarayıcı cookie'yi isteklere yine otomatik ekler (axios withCredentials), frontend'in onu okumasına gerek yok.
                HttpOnly = true,
                //? SameSite=Lax: Başka bir siteden gelen arka plan istekleri (form post, fetch) cookie'yi taşımaz -> CSRF'e karşı koruma.
                //? localhost:3000 ve localhost:5274 port farkına rağmen "aynı site" sayılır, bu yüzden geliştirmede sorun çıkarmaz.
                //! Frontend ve API ileride farklı domainlerde yayınlanırsa SameSite=None + Secure gerekir.
                SameSite = SameSiteMode.Lax,
                //? Secure: Cookie sadece HTTPS üzerinden gönderilir, ağda düz metin olarak dolaşmaz.
                //! Development'ta API http çalıştığı için kapalı; açık olsaydı bazı tarayıcılar cookie'yi kaydetmezdi.
                Secure = !_env.IsDevelopment()
            };

            Response.Cookies.Append("customerId",customerId,cookieOptions);
            cart = new Cart{CustomerId=customerId};

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

        }
        return cart;
    }

    private CartDTO CartToDTO(Cart cart)
    {
        return new CartDTO
        {
            CartId = cart.CartId,
            CustomerId = cart.CustomerId,
            CartItems = cart.CartItems.Select(item => new CartItemDTO
            {
                ProductId=item.ProductId,
                Name = item.Product.Name,
                Price = item.Product.Price,
                Quantity= item.Quantity,
                ImageUrl = item.Product.ImageUrl
            }).ToList()
        };
    }
}