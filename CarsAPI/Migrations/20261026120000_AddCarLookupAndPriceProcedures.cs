using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarsAPI.Migrations;

public partial class AddCarLookupAndPriceProcedures : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateTime>(
            name: "CreatedAt",
            table: "Cars",
            type: "datetime2",
            nullable: false,
            defaultValueSql: "GETUTCDATE()",
            oldClrType: typeof(DateTime),
            oldType: "datetime2",
            oldDefaultValue: new DateTime(2026, 10, 26));

        migrationBuilder.Sql("""
            CREATE OR ALTER PROCEDURE dbo.GetCarsByMake
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
            CREATE OR ALTER PROCEDURE dbo.UpdateCarPrice
                @CarId INT,
                @NewPrice DECIMAL(18, 2),
                @RowsAffected INT OUTPUT
            AS
            BEGIN
                SET NOCOUNT ON;

                UPDATE dbo.Cars
                SET [Price] = @NewPrice
                WHERE [Id] = @CarId;

                SET @RowsAffected = @@ROWCOUNT;
            END
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.UpdateCarPrice;");
        migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.GetCarsByMake;");

        migrationBuilder.AlterColumn<DateTime>(
            name: "CreatedAt",
            table: "Cars",
            type: "datetime2",
            nullable: false,
            defaultValue: new DateTime(2026, 10, 26),
            oldClrType: typeof(DateTime),
            oldType: "datetime2",
            oldDefaultValueSql: "GETUTCDATE()");
    }
}
