using Microsoft.EntityFrameworkCore;
using API.Entity;

namespace API.Data;

public class DataContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>().HasData(
            new List<Product>
            {
                new Product{Id=1, Name="Apple Watch Series 1", Description="Akıllı Saat Açıklaması", ImageUrl="1.jpg", Price=7000, IsActive=true, Stock=100 },
                new Product{Id=2, Name="Apple Watch Series 2", Description="Akıllı Saat Açıklaması", ImageUrl="2.jpg", Price=8000, IsActive=true, Stock=100 },
                new Product{Id=3, Name="Apple Watch Series 3", Description="Akıllı Saat Açıklaması", ImageUrl="3.jpg", Price=9000, IsActive=true, Stock=100 },
                new Product{Id=4, Name="Xiaomi Redmi Watch 1", Description="Akıllı Saat Açıklaması", ImageUrl="4.jpg", Price=10000, IsActive=true, Stock=100 },
                new Product{Id=5, Name="Xiaomi Redmi Watch 2", Description="Akıllı Saat Açıklaması", ImageUrl="5.jpg", Price=10000, IsActive=true, Stock=100 },
                new Product{Id=6, Name="Xiaomi Redmi Watch 3", Description="Akıllı Saat Açıklaması", ImageUrl="6.jpg", Price=10000, IsActive=true, Stock=100 },
                new Product{Id=7, Name="Xiaomi Redmi Watch 4", Description="Akıllı Saat Açıklaması", ImageUrl="7.jpg", Price=10000, IsActive=true, Stock=100 },

            }

        );
    }
}