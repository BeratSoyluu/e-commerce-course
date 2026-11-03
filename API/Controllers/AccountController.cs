using API.Data;
using API.DTO;
using API.Entity;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly DataContext _context;

    public AccountController(UserManager<AppUser> userManager, TokenService tokenService, DataContext context)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _context = context;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> Login(LoginDTO model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);

        //! "Kullanıcı yok" ile "şifre yanlış" için aynı mesaj: hangi e-postaların kayıtlı olduğu dışarıya sızmasın.
        if(user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
            return Unauthorized(new ProblemDetails{Title = "E-posta veya şifre hatalı."});

        await TransferAnonymousCart(user.UserName!);

        return await CreateUserDTO(user);
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterDTO model)
    {
        var user = new AppUser
        {
            Name = model.Name,
            UserName = model.Email, //? Kullanıcı adı olarak e-postayı kullanıyoruz, ayrıca kullanıcı adı sormuyoruz.
            Email = model.Email
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if(!result.Succeeded)
        {
            //? Identity hatalarını ModelState'e koyup ValidationProblem dönüyoruz; frontend interceptor'u "errors"u zaten toast'luyor.
            foreach(var error in result.Errors)
                ModelState.AddModelError(error.Code, error.Description);
            return ValidationProblem();
        }

        await _userManager.AddToRoleAsync(user, "Customer");
        return StatusCode(201);
    }

    //? [Authorize]: geçerli bir JWT yoksa controller'a girilmeden 401 döner.
    //? Frontend açılışta localStorage'daki token'ın hâlâ geçerli olup olmadığını bununla kontrol ediyor.
    [Authorize]
    [HttpGet("getUser")]
    public async Task<ActionResult<UserDTO>> GetUser()
    {
        var user = await _userManager.FindByNameAsync(User.Identity!.Name!);

        //! Token geçerli ama kullanıcı silinmiş olabilir
        if(user == null)
            return Unauthorized(new ProblemDetails{Title = "Kullanıcı bulunamadı."});

        return await CreateUserDTO(user);
    }

    private async Task<UserDTO> CreateUserDTO(AppUser user)
    {
        return new UserDTO
        {
            Name = user.Name,
            Email = user.Email!,
            Token = await _tokenService.GenerateToken(user),
            Roles = await _userManager.GetRolesAsync(user)
        };
    }

    //? Giriş yapmadan sepete ürün ekleyen kullanıcının sepeti kaybolmasın: cookie'deki anonim sepet hesaba taşınır.
    private async Task TransferAnonymousCart(string userName)
    {
        var anonymousId = Request.Cookies["customerId"];
        if(string.IsNullOrEmpty(anonymousId)) return;

        var anonymousCart = await _context.Carts.IncludeItems().FirstOrDefaultAsync(c => c.CustomerId == anonymousId);
        if(anonymousCart != null)
        {
            var userCart = await _context.Carts.IncludeItems().FirstOrDefaultAsync(c => c.CustomerId == userName);

            if(userCart == null)
            {
                //? Kullanıcının sepeti yoksa anonim sepetin sahibini değiştirmek yeterli
                anonymousCart.CustomerId = userName;
            }
            else
            {
                //? İkisi de varsa ürünler kullanıcının sepetine eklenir, anonim sepet silinir
                foreach(var item in anonymousCart.CartItems)
                {
                    if(!item.Product.IsActive) continue;
                    //! Birleşen adet stoğu aşmasın
                    var inUserCart = userCart.CartItems.FirstOrDefault(i => i.ProductId == item.ProductId)?.Quantity ?? 0;
                    var quantity = Math.Min(item.Quantity, item.Product.Stock - inUserCart);
                    if(quantity > 0) userCart.AddItem(item.Product, quantity);
                }
                _context.Carts.Remove(anonymousCart);
            }
            await _context.SaveChangesAsync();
        }

        //? Artık sepet kullanıcı adıyla bulunuyor; anonim kimliğe gerek yok.
        Response.Cookies.Delete("customerId");
    }
}
