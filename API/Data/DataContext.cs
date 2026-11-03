using Microsoft.EntityFrameworkCore;
using API.Entity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace API.Data;

//? IdentityDbContext; kullanıcı, rol, kullanıcı-rol vb. tablolarını (AspNetUsers, AspNetRoles...) modele ekler.
public class DataContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        //? Enum veritabanında sayı (0,1,2) yerine metin ("Pending") olarak saklansın; tabloya bakınca okunur, enum sırası değişse bozulmaz.
        modelBuilder.Entity<Order>().Property(o => o.OrderStatus).HasConversion<string>();

        modelBuilder.Entity<Product>().HasData(
            new List<Product>
            {
                new Product{Id=1, Name="Apple Watch Series 1", Brand="Apple", Description="Akıllı Saat Açıklaması", ImageUrl="1.jpg", Price=7000, IsActive=true, Stock=100 },
                new Product{Id=2, Name="Apple Watch Series 2", Brand="Apple", Description="Akıllı Saat Açıklaması", ImageUrl="2.jpg", Price=8000, IsActive=true, Stock=100 },
                new Product{Id=3, Name="Apple Watch Series 3", Brand="Apple", Description="Akıllı Saat Açıklaması", ImageUrl="3.jpg", Price=9000, IsActive=true, Stock=100 },
                new Product{Id=4, Name="Xiaomi Redmi Watch 1", Brand="Xiaomi", Description="Akıllı Saat Açıklaması", ImageUrl="4.jpg", Price=10000, IsActive=true, Stock=100 },
                new Product{Id=5, Name="Xiaomi Redmi Watch 2", Brand="Xiaomi", Description="Akıllı Saat Açıklaması", ImageUrl="5.jpg", Price=10000, IsActive=true, Stock=100 },
                new Product{Id=6, Name="Xiaomi Redmi Watch 3", Brand="Xiaomi", Description="Akıllı Saat Açıklaması", ImageUrl="6.jpg", Price=10000, IsActive=true, Stock=100 },
                new Product{Id=7, Name="Xiaomi Redmi Watch 4", Brand="Xiaomi", Description="Akıllı Saat Açıklaması", ImageUrl="7.jpg", Price=10000, IsActive=true, Stock=100 },

            }

        );
    }
}