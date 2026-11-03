using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarsAPI.Migrations
{
    public partial class GetCarByYear : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                CREATE PROCEDURE dbo.GetCarByYear
                    @Year INT
                AS
                BEGIN
                    SET NOCOUNT ON;

                    SELECT *
                    FROM dbo.Cars
                    WHERE [Year] = @Year;
                END
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "DROP PROCEDURE IF EXISTS dbo.GetCarByYear;");
        }
    }
}