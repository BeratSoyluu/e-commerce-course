using API.DTO;
using API.Entity;

namespace API.Extensions;

//? IQueryable üzerinde çalıştıkları için her adım SQL'e eklenir; sorgu ancak ToListAsync/CountAsync'te çalışır.
//? Controller'da zincir halinde okunur: Products.Search(..).Filter(..).Sort(..)
public static class ProductExtensions
{
    public static IQueryable<Product> Sort(this IQueryable<Product> query, string? orderBy)
    {
        return orderBy switch
        {
            "price" => query.OrderBy(p => p.Price),
            "priceDesc" => query.OrderByDescending(p => p.Price),
            "newest" => query.OrderByDescending(p => p.Id), //? Tarih alanı yok; en büyük Id en son eklenen ürün
            //! Sayfalamada sabit bir sıra şart, yoksa aynı ürün iki sayfada birden görünebilir.
            _ => query.OrderBy(p => p.Name)
        };
    }

    public static IQueryable<Product> Search(this IQueryable<Product> query, string? searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm)) return query;

        //! C# tarafında ToLowerInvariant şart: tr-TR kültüründe "SERIES".ToLower() = "serıes" (noktasız ı) olur
        //! ve SQL tarafındaki LOWER() sonucuyla eşleşmez.
        var term = searchTerm.Trim().ToLowerInvariant();
        //? p.Name.ToLower() SQL'de LOWER() olur, büyük/küçük harf farkı aranmaz.
        return query.Where(p => p.Name!.ToLower().Contains(term));
    }

    public static IQueryable<Product> Filter(this IQueryable<Product> query, string? brands)
    {
        if (string.IsNullOrWhiteSpace(brands)) return query;

        var brandList = brands.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(b => b.ToLowerInvariant())
            .ToList();
        //? Contains SQL'de "IN (...)" olur
        return query.Where(p => p.Brand != null && brandList.Contains(p.Brand.ToLower()));
    }

    //? Projeksiyon SQL'de yapılır: sadece DTO'daki kolonlar seçilir. Hem liste hem detay aynı eşlemeyi kullanır.
    public static IQueryable<ProductDTO> ToDTO(this IQueryable<Product> query)
    {
        return query.Select(p => new ProductDTO
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            IsActive = p.IsActive,
            ImageUrl = p.ImageUrl,
            Stock = p.Stock,
            Brand = p.Brand
        });
    }
}
