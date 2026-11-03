using Microsoft.EntityFrameworkCore;

namespace API.RequestHelpers;

//? Frontend'e "Pagination" header'ında gönderilen sayfa bilgisi
public class MetaData
{
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}

//? List<T>'den türediği için controller'da normal liste gibi dönülebilir; sayfa bilgisi MetaData'da taşınır.
public class PagedList<T> : List<T>
{
    public MetaData MetaData { get; set; }

    public PagedList(List<T> items, int count, int pageNumber, int pageSize)
    {
        MetaData = new MetaData
        {
            TotalCount = count,
            PageSize = pageSize,
            CurrentPage = pageNumber,
            TotalPages = (int)Math.Ceiling(count / (double)pageSize)
        };
        AddRange(items);
    }

    public static async Task<PagedList<T>> ToPagedList(IQueryable<T> query, int pageNumber, int pageSize)
    {
        //? İki sorgu atılır: toplam sayı (COUNT) ve sadece istenen sayfa (LIMIT/OFFSET). Tüm tablo belleğe alınmaz.
        var count = await query.CountAsync();
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedList<T>(items, count, pageNumber, pageSize);
    }
}
