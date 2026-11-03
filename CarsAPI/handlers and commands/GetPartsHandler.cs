using CarsAPI.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.handlers_and_commands
{
    public class GetPartsHandler(AppDbContext context)
        : IRequestHandler<GetParts, PagedResult<PartsDto>>
    {
        public async Task<PagedResult<PartsDto>> Handle(
            GetParts request,
            CancellationToken cancellationToken)
        {
            var query = context.Parts
                .AsNoTracking()
                .Select(p => new PartsDto
                {
                    Id = p.Id,
                    Manufacturer = p.Manufacturer,
                    Description = p.Description,
                    Price = p.Price,
                    CarId = p.CarId,
                    CarName = p.Car == null
                        ? null
                        : p.Car.Make + " " + p.Car.Model
                });
            var totalCount = await query.CountAsync(cancellationToken);
            var parts = await query
                .OrderBy(part => part.Id)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new(parts, request.PageNumber, request.PageSize, totalCount);
        }
    }
}
