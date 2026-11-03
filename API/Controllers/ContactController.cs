using API.Data;
using API.DTO;
using API.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly DataContext _context;

    public ContactController(DataContext context)
    {
        _context = context;
    }

    //? Giriş gerektirmiyor: ziyaretçi de mesaj bırakabilmeli.
    [HttpPost]
    public async Task<ActionResult> SendMessage(CreateContactMessageDTO model)
    {
        _context.ContactMessages.Add(new ContactMessage
        {
            Name = model.Name.Trim(),
            Email = model.Email.Trim(),
            Subject = model.Subject.Trim(),
            Message = model.Message.Trim()
        });
        await _context.SaveChangesAsync();

        return StatusCode(201, new { message = "Mesajınız alındı, en kısa sürede dönüş yapacağız." });
    }

    //? Gelen mesajları sadece admin görebilir
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<List<ContactMessageDTO>>> GetMessages()
    {
        return await _context.ContactMessages
            .OrderByDescending(m => m.Id)
            .Select(m => new ContactMessageDTO
            {
                Id = m.Id,
                Name = m.Name,
                Email = m.Email,
                Subject = m.Subject,
                Message = m.Message,
                CreatedAt = DateTime.SpecifyKind(m.CreatedAt, DateTimeKind.Utc)
            })
            .ToListAsync();
    }
}
