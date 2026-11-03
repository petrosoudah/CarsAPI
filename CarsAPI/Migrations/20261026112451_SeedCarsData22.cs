using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarsAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedCarsData22 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO dbo.Cars
                    (Make, Model, [Year], Horsepower,
                     Price, Color, IsAvailable, CreatedAt)
                VALUES
                ('Jaguar', 'XF', 2020, 300,
                     45000.00, 'Black', 1, GETUTCDATE()),
                     ('Porsche', '911', 2021, 450,
                        120000.00, 'Red', 1, GETUTCDATE()),
                        ('Lamborghini', 'Huracan', 2022, 610,
                        250000.00, 'Yellow', 1, GETUTCDATE()),
                        ('Ferrari', '488', 2023, 660,
                        300000.00, 'Red', 1, GETUTCDATE()),
                        ('Aston Martin', 'DB11', 2024, 503,
                        200000.00, 'Silver', 1, GETUTCDATE()),
                        ('McLaren', '720S', 2025, 710,
                        350000.00, 'Orange', 1, GETUTCDATE()),
                        ('Mercedes-Benz', 'AMG GT', 2026, 577,
                        150000.00, 'Green', 1, GETUTCDATE()),
                        ('Audi', 'R8', 2027, 562,
                        170000.00, 'Blue', 1, GETUTCDATE()),
                        ('BMW', 'M8', 2028, 617,
                        140000.00, 'White', 1, GETUTCDATE()),
                        ('Chevrolet', 'Corvette', 2027, 495,
                        90000.00, 'Red', 1, GETUTCDATE()),
                        ('Ford', 'GT', 2030, 660,
                        200000.00, 'Blue', 1, GETUTCDATE()),
                    ('MG', '3', 2025, 115,
                     13500.00, 'Dark Grey', 1, GETUTCDATE());
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
