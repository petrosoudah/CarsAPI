using CarsAPI.Data;
using CarsAPI.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.handlers_and_commands
{
    public class GetCarByYearHandler(AppDbContext context)
        : IRequestHandler<GetCarByYear, CarsAPI.Data.PagedResult<Cars>>
    {
        public async Task<CarsAPI.Data.PagedResult<Cars>> Handle(
            GetCarByYear request,
            CancellationToken cancellationToken)
        {
            var totalCount = await context.Cars
                .AsNoTracking()
                .CountAsync(car => car.Year == request.Year, cancellationToken);
            var cars = new List<Cars>();
            await foreach (var car in context.Cars
                .FromSqlInterpolated($"EXEC dbo.GetCarByYear @Year={request.Year}, @PageNumber={request.PageNumber}, @PageSize={request.PageSize}")
                .AsNoTracking()
                .AsAsyncEnumerable()
                .WithCancellation(cancellationToken))
            {
                cars.Add(car);
            }
            return new(cars, request.PageNumber, request.PageSize, totalCount);
        }
    }
}
