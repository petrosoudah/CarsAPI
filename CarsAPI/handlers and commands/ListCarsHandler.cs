using CarsAPI.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.handlers_and_commands
{
    public class ListCarsHandler(AppDbContext context)
        : IRequestHandler<ListCars, CarsAPI.Data.PagedResult<CarsAPI.Models.Cars>>
    {
        public async Task<CarsAPI.Data.PagedResult<CarsAPI.Models.Cars>> Handle(
            ListCars request,
            CancellationToken cancellationToken)
        {
            var query = context.Cars.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                query = query.Where(car => (car.Make + " " + car.Model).ToLower().Contains(search));
            }
            if (request.IsAvailable.HasValue)
            {
                query = query.Where(car => car.IsAvailable == request.IsAvailable.Value);
            }
            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .OrderBy(car => car.Id)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new(items, request.PageNumber, request.PageSize, totalCount);
        }
    }
}
