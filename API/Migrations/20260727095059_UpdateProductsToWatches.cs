using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProductsToWatches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "Akıllı Saat Açıklaması", "Apple Watch Series 1", 7000m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "Akıllı Saat Açıklaması", "Apple Watch Series 2", 8000m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "IsActive", "Name", "Price" },
                values: new object[] { "Akıllı Saat Açıklaması", true, "Apple Watch Series 3", 9000m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "Akıllı Saat Açıklaması", "Xiaomi Redmi Watch 1", 10000m });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Description", "ImageUrl", "IsActive", "Name", "Price", "Stock" },
                values: new object[,]
                {
                    { 5, "Akıllı Saat Açıklaması", "5.jpg", true, "Xiaomi Redmi Watch 2", 10000m, 100 },
                    { 6, "Akıllı Saat Açıklaması", "6.jpg", true, "Xiaomi Redmi Watch 3", 10000m, 100 },
                    { 7, "Akıllı Saat Açıklaması", "7.jpg", true, "Xiaomi Redmi Watch 4", 10000m, 100 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "Telefon Açıklaması", "Iphone 15", 70000m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "Telefon Açıklaması", "Iphone 16", 80000m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "IsActive", "Name", "Price" },
                values: new object[] { "Telefon Açıklaması", false, "Iphone 16 Pro", 90000m });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "Price" },
                values: new object[] { "Telefon Açıklaması", "Iphone 16 Pro Max", 100000m });
        }
    }
}
