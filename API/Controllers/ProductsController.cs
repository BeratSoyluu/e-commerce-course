using API.Data;
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

        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }

        // api/products/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int? id)
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

            return Ok(product);
        }
    }
}