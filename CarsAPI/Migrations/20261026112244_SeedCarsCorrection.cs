using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarsAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedCarsCorrection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
        INSERT INTO dbo.Cars
            (Make, Model, [Year], Horsepower,
             Price, Color, IsAvailable, CreatedAt)
        VALUES
            ('Kia', 'Sephia', 1996, 120,
             500.00, 'White', 1, GETUTCDATE());
        """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
