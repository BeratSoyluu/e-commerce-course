using API.Data;
using API.DTO;
using API.Extensions;
using API.RequestHelpers;
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
        //? [FromQuery]: ProductParams'ın alanları query string'den doldurulur.
        [HttpGet]
        public async Task<ActionResult<List<ProductDTO>>> GetProducts([FromQuery] ProductParams productParams)
        {
            //? Filtre SQL'e çevrilir (WHERE IsActive = 1); pasif ürünler veritabanından hiç çekilmez.
            var query = _context.Products
                .Where(p => p.IsActive)
                .Search(productParams.SearchTerm)
                .Filter(productParams.Brands)
                .Sort(productParams.OrderBy)
                .ToDTO();

            var products = await PagedList<ProductDTO>.ToPagedList(query, productParams.PageNumber, productParams.PageSize);

            Response.AddPaginationHeader(products.MetaData);
            return products;
        }

        //? Filtre panelindeki marka listesi. Sabit yazmak yerine veritabanından geliyor; yeni marka eklenince otomatik görünür.
        [HttpGet("filters")]
        public async Task<ActionResult> GetFilters()
        {
            var brands = await _context.Products
                .Where(p => p.IsActive && p.Brand != null)
                .Select(p => p.Brand!)
                .Distinct()
                .OrderBy(b => b)
                .ToListAsync();

            return Ok(new { brands });
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
            var product = await _context.Products.Where(p => p.Id == id).ToDTO().FirstOrDefaultAsync();
            if(product == null) //? product yoksa
            {
                return NotFound(); //! 404 hata kodu
            }

            return product;
        }
    }
}
