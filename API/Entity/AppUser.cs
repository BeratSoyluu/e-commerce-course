using Microsoft.AspNetCore.Identity;

namespace API.Entity;

//? IdentityUser; Id, UserName, Email, PasswordHash gibi alanları hazır getirir. Biz sadece ad soyad ekliyoruz.
//! Bu projede UserName = Email. Sepet ve siparişlerdeki CustomerId bu değeri tutar.
public class AppUser : IdentityUser
{
    public string? Name { get; set; }
}
