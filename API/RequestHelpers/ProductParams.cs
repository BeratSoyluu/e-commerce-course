namespace API.RequestHelpers;

//? Query string'den gelen katalog parametreleri: /api/products?searchTerm=watch&orderBy=price&brands=Apple,Xiaomi&pageNumber=2
public class ProductParams
{
    //! Tek istekte binlerce satır çekilmesin diye üst sınır sunucuda zorlanıyor; istemciye güvenmiyoruz.
    private const int MaxPageSize = 20;

    public string? SearchTerm { get; set; }
    public string? OrderBy { get; set; } //? name (varsayılan), price, priceDesc, newest
    public string? Brands { get; set; } //? Virgülle ayrılmış: "Apple,Xiaomi"

    private int _pageNumber = 1;
    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    private int _pageSize = 8;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? 1 : Math.Min(value, MaxPageSize);
    }
}
