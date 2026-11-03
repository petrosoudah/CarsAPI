using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarsAPI.Migrations;

public partial class AddPagingToCarProcedures : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER PROCEDURE dbo.GetCarsByMake
                @Make NVARCHAR(50),
                @PageNumber INT,
                @PageSize INT
            AS
            BEGIN
                SET NOCOUNT ON;

                SELECT *
                FROM dbo.Cars
                WHERE [Make] = @Make
                ORDER BY [Id]
                OFFSET (@PageNumber - 1) * @PageSize ROWS
                FETCH NEXT @PageSize ROWS ONLY;
            END
            """);

        migrationBuilder.Sql("""
            ALTER PROCEDURE dbo.GetCarByYear
                @Year INT,
                @PageNumber INT,
                @PageSize INT
            AS
            BEGIN
                SET NOCOUNT ON;

                SELECT *
                FROM dbo.Cars
                WHERE [Year] = @Year
                ORDER BY [Id]
                OFFSET (@PageNumber - 1) * @PageSize ROWS
                FETCH NEXT @PageSize ROWS ONLY;
            END
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER PROCEDURE dbo.GetCarsByMake
                @Make NVARCHAR(50)
            AS
            BEGIN
                SET NOCOUNT ON;

                SELECT *
                FROM dbo.Cars
                WHERE [Make] = @Make;
            END
            """);

        migrationBuilder.Sql("""
            ALTER PROCEDURE dbo.GetCarByYear
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
}
