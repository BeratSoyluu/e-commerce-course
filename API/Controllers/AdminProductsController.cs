using API.Data;
using API.DTO;
using API.Entity;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

//! Roles = "Admin": token'daki "role" claim'inde Admin yoksa 403 döner (giriş yoksa 401).
//! Bu kontrol sunucuda yapılmak zorunda; frontend'deki AdminGuard sadece menüyü gizler, güvenlik sağlamaz.
[Authorize(Roles = "Admin")]
[ApiController]
[Route("/api/admin/products")]
public class AdminProductsController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ImageService _imageService;

    public AdminProductsController(DataContext context, ImageService imageService)
    {
        _context = context;
        _imageService = imageService;
    }

    //? Katalogdan farklı olarak pasif ürünler de listelenir (admin tekrar aktif edebilsin).
    [HttpGet]
    public async Task<ActionResult<List<ProductDTO>>> GetProducts()
    {
        return await _context.Products.OrderBy(p => p.Id).ToDTO().ToListAsync();
    }

    [HttpPost]
    [RequestSizeLimit(5 * 1024 * 1024)] //? Görsel 2 MB + form alanları; daha büyük istekler okunmadan reddedilir
    public async Task<ActionResult<ProductDTO>> CreateProduct([FromForm] ProductFormDTO model)
    {
        if (model.Image == null)
            return BadRequest(new ProblemDetails { Title = "Ürün görseli zorunlu." });

        var image = await _imageService.Save(model.Image);
        if (image.Error != null)
            return BadRequest(new ProblemDetails { Title = image.Error });

        var product = new Product
        {
            Name = model.Name,
            Description = model.Description,
            Brand = model.Brand,
            Price = model.Price,
            Stock = model.Stock,
            IsActive = model.IsActive,
            ImageUrl = image.FileName
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(ProductsController.GetProduct), "Products", new { id = product.Id },
            await _context.Products.Where(p => p.Id == product.Id).ToDTO().FirstAsync());
    }

    [HttpPut("{id}")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<ActionResult<ProductDTO>> UpdateProduct(int id, [FromForm] ProductFormDTO model)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound(new ProblemDetails { Title = "Ürün bulunamadı." });

        if (model.Image != null)
        {
            var image = await _imageService.Save(model.Image);
            if (image.Error != null)
                return BadRequest(new ProblemDetails { Title = image.Error });

            //? Yeni görsel kaydedildikten sonra eskisi silinir; kaydetme başarısız olsaydı ürün görselsiz kalmasın.
            _imageService.Delete(product.ImageUrl);
            product.ImageUrl = image.FileName;
        }

        product.Name = model.Name;
        product.Description = model.Description;
        product.Brand = model.Brand;
        product.Price = model.Price;
        product.Stock = model.Stock;
        product.IsActive = model.IsActive;

        await _context.SaveChangesAsync();
        return await _context.Products.Where(p => p.Id == id).ToDTO().FirstAsync();
    }

    //! Soft delete: ürün silinmez, pasif yapılır. Eski siparişler ve sepetler ProductId ile bu ürüne bağlı;
    //! gerçekten silseydik sepet kalemleri (cascade) kaybolurdu ve ürün geri getirilemezdi.
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound(new ProblemDetails { Title = "Ürün bulunamadı." });

        product.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
