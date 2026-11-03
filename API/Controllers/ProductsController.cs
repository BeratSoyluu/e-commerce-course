using API.Data;
using API.DTO;
using API.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;



namespace API.Controllers
{
    [ApiController]
    [Route("/api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly DataContext _context;
        public ProductsController(DataContext context)
        {
            _context = context;
        }

        //? ActionResult<T> kullanınca Swagger dönüş tipini (ProductDTO) şemada gösterebiliyor; IActionResult'ta bu bilgi yok.
        [HttpGet]
        public async Task<ActionResult<List<ProductDTO>>> GetProducts()
        {
            //? Filtre SQL'e çevrilir (WHERE IsActive = 1); pasif ürünler veritabanından hiç çekilmez.
            var products = await _context.Products
                .Where(p => p.IsActive)
                .Select(p => ProductToDTO(p))
                .ToListAsync();
            return products;
        }

        // api/products/1
        //! Detay pasif ürünü de döner: eski bir linkle gelen kullanıcı 404 yerine "satışta değil" mesajını görür.
        //! Sepete eklemeyi CartController zaten engelliyor.
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDTO>> GetProduct(int? id)
        {
            if (id == null) //? id girilmemişse
            {
                return NotFound(); //! 404 hata kodu
            }
            var product = await _context.Products.FindAsync(id);
            //var product = await _context.Products.FirstOrDefaultAsync(i => i.Id == id);
            if(product == null) //? product yoksa
            {
                return NotFound(); //! 404 hata kodu
            }

            return ProductToDTO(product);
        }

        private static ProductDTO ProductToDTO(Product product)
        {
            return new ProductDTO
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                IsActive = product.IsActive,
                ImageUrl = product.ImageUrl,
                Stock = product.Stock
            };
        }
    }
}
