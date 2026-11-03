using System.Text.Json;
using API.RequestHelpers;

namespace API.Extensions;

public static class HttpExtensions
{
    //? Sayfa bilgisini gövdeye değil header'a koyuyoruz: gövde düz ürün dizisi olarak kalır.
    //! Tarayıcı JS'i özel header'ları ancak CORS'ta WithExposedHeaders("Pagination") ile okuyabilir.
    public static void AddPaginationHeader(this HttpResponse response, MetaData metaData)
    {
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        response.Headers.Append("Pagination", JsonSerializer.Serialize(metaData, options));
    }
}
