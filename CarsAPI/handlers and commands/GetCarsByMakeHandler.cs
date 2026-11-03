using CarsAPI.Data;
using CarsAPI.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.handlers_and_commands;

public class GetCarsByMakeHandler(AppDbContext context)
    : IRequestHandler<GetCarsByMake, CarsAPI.Data.PagedResult<Cars>>
{
    public async Task<CarsAPI.Data.PagedResult<Cars>> Handle(
        GetCarsByMake request,
        CancellationToken cancellationToken)
    {
        var totalCount = await context.Cars
            .AsNoTracking()
            .CountAsync(car => car.Make == request.Make, cancellationToken);
        var cars = new List<Cars>();

        await foreach (var car in context.Cars
            .FromSqlInterpolated(
                $"EXEC dbo.GetCarsByMake @Make={request.Make}, @PageNumber={request.PageNumber}, @PageSize={request.PageSize}")
            .AsNoTracking()
            .AsAsyncEnumerable()
            .WithCancellation(cancellationToken))
        {
            cars.Add(car);
        }

        return new(cars, request.PageNumber, request.PageSize, totalCount);
    }
}
