# E-Ticaret

ASP.NET Core .NET 10 Web API + React 19 ile yazılmış e-ticaret uygulaması.

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
