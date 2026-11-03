using Microsoft.AspNetCore.Mvc;
namespace API.Controllers;
[ApiController]
[Route("/api/[controller]")]
public class ErrorController : ControllerBase
{
    [HttpGet("not-found")]
    public IActionResult NotFoundError()
    {
        return NotFound(); //! 404 sayfanın sunucuda bulunamadığı
    }

    [HttpGet("bad-request")]
    public IActionResult BadRequestError()
    {
        return BadRequest(); //! 400 tarayıcınızın gönderdiği isteğin sunucu tarafından bozuk veya anlaşılamaz bulunması
    }

    [HttpGet("unauthorized")]
    public IActionResult UnauthorizedError()
    {
        return Unauthorized(); //! 401 eksik yetkilendirme nedeniyle sunucunun isteğinizi onaylamadığını
    }

    [HttpGet("server-error")]
    public IActionResult ServerError()
    {
        throw new Exception("server error"); //! 500 bir web sitesinin veya uygulamanın arkasındaki ana bilgisayarın (sunucunun) isteğinizi yerine getiremediğini gösteren genel bir hatadır.
    }

    [HttpGet("validation-error")]
    public IActionResult ValidationError()
    {
        ModelState.AddModelError("validation error 1","Vadalition error details");
        ModelState.AddModelError("validation error 2","Vadalition error details");
        return ValidationProblem();
    }
}