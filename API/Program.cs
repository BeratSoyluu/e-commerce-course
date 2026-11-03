using API.Data;
using Microsoft.EntityFrameworkCore;
using API.Middlewares;
using System.Text;
using System.Globalization;
using Microsoft.AspNetCore.Localization;
using API.Entity;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

//? Dışarıdan kullanmak istediğimiz servislerin eklendiği yer.
builder.Services.AddDbContext<DataContext>(options =>
{
    var config = builder.Configuration;
    var connectionString = config.GetConnectionString("defaultConnection");
    options.UseSqlite(connectionString);
});


builder.Services.AddCors();

//? AddIdentity yerine AddIdentityCore: AddIdentity cookie tabanlı oturumu varsayılan yapar ve [Authorize] 401 yerine
//? /Account/Login sayfasına 302 yönlendirmesi döner. API'de sadece kullanıcı/rol yönetimi lazım, oturumu JWT taşıyor.
builder.Services.AddIdentityCore<AppUser>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.Password.RequireNonAlphanumeric = false; //? En az 6 karakter + büyük harf + küçük harf + rakam yeterli
})
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<DataContext>()
    .AddErrorDescriber<TurkishIdentityErrorDescriber>();

//! Development'ta appsettings.Development.json'daki test değeri, user-secrets'ta değer varsa o kullanılır (user-secrets daha sonra yüklenip üzerine yazar).
//! Production'da anahtar yoksa uygulama hiç başlamaz: imzasız/zayıf anahtarla çalışmaktansa hemen hata vermek daha güvenli.
var jwtKey = builder.Configuration["JWTSecurityKey"];
if (string.IsNullOrEmpty(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
    throw new InvalidOperationException("JWTSecurityKey tanımlı değil ya da 32 bayttan kısa (HMAC-SHA256 en az 256 bit ister).");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        //? Claim isimleri token'daki gibi kalsın ("role" -> uzun Microsoft URI'sine çevrilmesin)
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            //? Token'ı aynı uygulama üretip doğruluyor; issuer/audience ayrımı birden fazla servis olduğunda anlamlı.
            ValidateIssuer = false,
            ValidateAudience = false,
            NameClaimType = JwtRegisteredClaimNames.UniqueName, //? User.Identity.Name = kullanıcı adı
            RoleClaimType = TokenService.RoleClaim //? [Authorize(Roles = "Admin")] bu claim'e bakar
        };
    });

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<ImageService>();


builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
{
    options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_0;
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandling>();

//! Middleware sırası: ExceptionHandling'den hemen sonra, model binding'den (MapControllers) önce olmalı.
//! Sebep: form (multipart) değerleri isteğin kültürüyle parse edilir. Sunucu tr-TR'de çalışınca "." binlik ayırıcı sayılıyor
//! ve admin formundan gelen "1234.50" fiyatı 123450 olarak kaydediliyordu. İstek kültürünü sabit (invariant) yapıyoruz;
//! sadece invariant desteklendiği için tarayıcının Accept-Language başlığı da kültürü değiştiremez.
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture(CultureInfo.InvariantCulture),
    SupportedCultures = [CultureInfo.InvariantCulture],
    SupportedUICultures = [CultureInfo.InvariantCulture]
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    options.SwaggerEndpoint("/openapi/v1.json","Demo API"));
}

//? Alt tarafta ise istediğimiz aşamada uygulamaya dahil ediyoruz.

app.UseHttpsRedirection();

app.UseStaticFiles();

//? CORS sadece development'ta: orada React Vite'tan (localhost:3000), API 5274'ten geliyor, yani farklı origin.
//? Production'da React build'i bu uygulamanın wwwroot'undan aynı adresten sunuluyor; CORS'a gerek yok.
//! Kapalı tutmak daha güvenli: başka bir sitedeki script, kullanıcının cookie'siyle API'mize istek atıp cevabı okuyamaz.
if (app.Environment.IsDevelopment())
{
    app.UseCors(opt =>
    {
        //? WithExposedHeaders: tarayıcı, CORS isteklerinde JS'e sadece temel header'ları gösterir. "Pagination"ı açıkça izinli yapıyoruz.
        opt.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins("http://localhost:3000").WithExposedHeaders("Pagination");
    });
}

//! Sıra önemli: UseAuthentication token'ı okuyup "bu kim?" sorusunu cevaplar (User'ı doldurur),
//! UseAuthorization "buna izni var mı?" diye bakar. Ters olursa yetki kontrolü her isteği anonim görür ve 401 döner.
//! İkisi de CORS'tan sonra: 401 cevapları da CORS header'ı taşısın, yoksa tarayıcı hatayı JS'e hiç göstermez.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

//? React Router adresleri (/catalog/3, /orders...) sunucuda dosya olarak yok. Controller'a da statik dosyaya da uymayan
//? her istek index.html'e düşer; sayfa açılınca React Router doğru sayfayı çizer. Sayfa yenilemede 404 alınmaz.
//? Build çıktısı wwwroot/app altında (vite.config.ts): wwwroot/images'taki ürün görselleriyle karışmasın diye.
app.MapFallbackToFile("app/index.html");
//! Olmayan bir /api adresi index.html (200) dönmesin; API istemcisi HTML yerine net bir 404 almalı.
//! Literal "/api" segmenti olduğu için bu route yukarıdaki genel fallback'ten önceliklidir.
app.MapFallback("/api/{**path}", () => Results.Problem(statusCode: 404, title: "Endpoint bulunamadı."));

await SeedDatabase.Initialize(app);

app.Run();
