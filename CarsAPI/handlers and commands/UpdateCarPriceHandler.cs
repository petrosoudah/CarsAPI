using CarsAPI.Data;
using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace CarsAPI.handlers_and_commands;

public class UpdateCarPriceHandler(AppDbContext context)
    : IRequestHandler<UpdateCarPrice, int>
{
    public async Task<int> Handle(
        UpdateCarPrice request,
        CancellationToken cancellationToken)
    {
        var rowsAffected = new SqlParameter(
            "@RowsAffected", SqlDbType.Int)
        {
            Direction = ParameterDirection.Output
        };

        await context.Database.ExecuteSqlRawAsync(
            """
            EXEC dbo.UpdateCarPrice
                @CarId = @p0,
                @NewPrice = @p1,
                @RowsAffected = @RowsAffected OUTPUT
            """,
            new object[]
            {
                request.CarId,
                request.NewPrice,
                rowsAffected
            },
            cancellationToken);

        return (int)rowsAffected.Value;
    }
}