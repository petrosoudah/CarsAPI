using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarsAPI.Migrations
{
    public partial class SeedCarsData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO dbo.Cars
                    (Make, Model, [Year], Horsepower,
                     Price, Color, IsAvailable, CreatedAt)
                VALUES
                    ('Hyundai', 'Tiburon', 2000, 140,
                     4500.00, 'Red', 1, GETUTCDATE()),

                    ('Honda', 'Accord', 1999, 135,
                     3500.00, 'Black', 1, GETUTCDATE()),

                    ('BMW', 'M3', 2005, 343,
                     15000.00, 'Blue', 0, GETUTCDATE()),
                     ('Ford', 'Mustang', 2010, 315,
                        20000.00, 'Yellow', 1, GETUTCDATE()),
                        ('Chevrolet', 'Camaro', 2012, 323,
                        22000.00, 'Green', 1, GETUTCDATE()),
                        ('Toyota', 'Supra', 1998, 276,
                        25000.00, 'White', 0, GETUTCDATE()),
                        ('Nissan', '350Z', 2003, 287,
                        28000.00, 'Blue', 1, GETUTCDATE());
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DELETE FROM dbo.Cars
                WHERE (Make = 'Hyundai' AND Model = 'Tiburon' AND [Year] = 2000)
                   OR (Make = 'Honda' AND Model = 'Accord' AND [Year] = 1999)
                   OR (Make = 'BMW' AND Model = 'M3' AND [Year] = 2005)
                   OR (Make = 'Ford' AND Model = 'Mustang' AND [Year] = 2010)
                   OR (Make = 'Chevrolet' AND Model = 'Camaro' AND [Year] = 2012)
                   OR (Make = 'Toyota' AND Model = 'Supra' AND [Year] = 1998)
                   OR (Make = 'Nissan' AND Model = '350Z' AND [Year] = 2003);
                """);
        }
    }
}