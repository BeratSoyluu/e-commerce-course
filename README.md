# E-Ticaret

ASP.NET Core .NET 10 Web API ve React 19 + TypeScript ile geliştirilmiş, akıllı saat satan full-stack bir e-ticaret uygulaması.
JWT tabanlı kimlik doğrulama, rol bazlı yetkilendirme, iyzico ödeme entegrasyonu, transaction ile stok yönetimi ve admin paneli içerir.

## Özellikler

- **Katalog:** arama (debounce), marka filtresi, sıralama, sayfalama (`Pagination` header'ı)
- **Sepet:** anonim kullanıcı için cookie ile takip, giriş yapınca hesaptaki sepetle birleşir, stok kontrolü
- **Hesap:** ASP.NET Core Identity + JWT, kayıt/giriş, korumalı sayfalar
- **Sipariş:** 3 adımlı checkout (adres, ödeme, özet), stok düşme ve sepet temizleme tek transaction'da
- **Ödeme:** iyzico sandbox; anahtar yoksa simülasyon. Başarısız ödemede stok geri alınır
- **Admin paneli:** ürün ekle/düzenle/satıştan kaldır (görsel yüklemeli), sipariş durumu yönetimi
- **Diğer:** iletişim formu, mobil uyumlu arayüz, Skeleton yükleme ekranları

## Teknolojiler

| Katman | Teknoloji |
|---|---|
| Backend | ASP.NET Core .NET 10 Web API, EF Core 10 + SQLite, ASP.NET Core Identity, JWT Bearer, OpenAPI 3.0 + Swagger UI, Iyzipay |
| Frontend | React 19, TypeScript, Vite 8, React Router 8, MUI 9, axios, react-hook-form, react-toastify |

## Klasör yapısı

```
API/      Controllers, DTO, Entity, Data (DataContext, seed), Extensions, RequestHelpers, Services, Migrations, wwwroot
Client/   src/api (requests.ts), components, context, model, pages, router, utils (helpers.ts)
```

## Kurulum

Gereksinimler: [.NET 10 SDK](https://dotnet.microsoft.com/download), Node.js 20+ ve EF Core CLI aracı:

```
dotnet tool install --global dotnet-ef
```

1. **Veritabanını oluşturun.** SQLite dosyası repoda yok; migration'lar ve seed verisiyle oluşturulur:
   ```
   cd API
   dotnet ef database update
   ```
2. **API'yi başlatın** (http://localhost:5274, Swagger: http://localhost:5274/swagger):
   ```
   cd API
   dotnet run
   ```
   İlk açılışta roller ve test admin hesabı oluşturulur.
3. **Frontend'i başlatın** (http://localhost:3000). Ayrı bir terminalde:
   ```
   cd Client
   npm install
   npm run dev
   ```
   API adresi `Client/.env.development` dosyasındaki `VITE_API_URL`'den okunur.

### Production (tek uygulama)

```
cd Client
npm run build          # çıktı API/wwwroot/app klasörüne yazılır
cd ../API
```

Production'da user-secrets yüklenmez; `JWTSecurityKey` ortam değişkeni olarak verilmelidir, yoksa uygulama başlamaz:

```powershell
# PowerShell
$env:JWTSecurityKey = "<en az 32 karakterlik rastgele bir değer>"
dotnet run --no-launch-profile -- --environment Production --urls http://localhost:5274
```

```bash
# bash
JWTSecurityKey="<en az 32 karakterlik rastgele bir değer>" dotnet run --no-launch-profile -- --environment Production --urls http://localhost:5274
```

Uygulama http://localhost:5274 adresinden açılır. React uygulaması API'nin kendisinden sunulur (`MapFallbackToFile`),
CORS ve Swagger kapalıdır, sepet cookie'si `Secure` işaretlidir (gerçek sunucuda HTTPS gerekir).

## Test hesapları

Development ortamında uygulama açılırken `appsettings.Development.json`'daki `SeedAdmin` bilgileriyle bir admin oluşturulur:

| Rol | E-posta | Şifre |
|---|---|---|
| Admin + Customer | `admin@eticaret.test` | `Admin123!` |

> Bu hesap sadece geliştirme içindir. Production'da `SeedAdmin` tanımlı değilse admin oluşturulmaz.

## JWT anahtarı

Development'ta `appsettings.Development.json`'daki test anahtarı kullanılır. Kendi anahtarınızı user-secrets ile verebilirsiniz (öncelikli olur):

```
cd API
dotnet user-secrets set "JWTSecurityKey" "<en az 32 karakterlik rastgele bir değer>"
```

Production'da `JWTSecurityKey` tanımlı değilse uygulama başlamaz.

## Ödeme (iyzico sandbox)

Ödeme [iyzico](https://dev.iyzipay.com) sandbox ortamı üzerinden alınır. API anahtarları repoda tutulmaz, user-secrets ile verilir:

```
cd API
dotnet user-secrets set "Iyzico:ApiKey" "<sandbox api key>"
dotnet user-secrets set "Iyzico:SecretKey" "<sandbox secret key>"
```

> **Anahtar tanımlı değilse** uygulama çökmez: ödeme **başarılı kabul edilir** (simülasyon) ve logda uyarı yazılır.
> Böylece iyzico hesabı olmadan da sipariş akışı denenebilir. Canlı ortamda anahtarların tanımlı olduğundan emin olun.

Kart bilgileri veritabanına yazılmaz ve loglanmaz; sadece sipariş isteğiyle iyzico'ya iletilir.

### Test kartları

Son kullanma tarihi olarak gelecekteki herhangi bir tarih (ör. `12/2030`), CVC olarak `123` kullanılabilir.

| Kart numarası | Sonuç |
|---|---|
| `5528790000000008` | Başarılı (Halkbank, Master Card, kredi) |
| `5890040000000016` | Başarılı (Akbank, Master Card, banka) |
| `4766620000000001` | Başarılı (Denizbank, Visa, banka) |
| `4111111111111129` | Başarısız: yetersiz bakiye |
| `4129111111111111` | Başarısız: işlem onaylanmadı |
| `4124111111111116` | Başarısız: geçersiz CVC |

> Güncel liste için iyzico dokümantasyonundaki "Test Kartları" sayfasına bakın. Başarısız kartlar sadece gerçek sandbox anahtarlarıyla
> reddedilir; simülasyon modunda her kart başarılı sayılır.
