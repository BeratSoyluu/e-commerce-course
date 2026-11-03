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
