using CarsAPI.Data;
using CarsAPI.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.handlers_and_commands
{
    public class GetCarPartsViewHandler(AppDbContext context)
        : IRequestHandler<GetCarPartsView, PagedResult<CarPartsView>>
    {
        public async Task<PagedResult<CarPartsView>> Handle(
            GetCarPartsView request,
            CancellationToken cancellationToken)
        {
            var query = context.CarPartsView.AsNoTracking();
            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .OrderBy(part => part.PartId)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new(items, request.PageNumber, request.PageSize, totalCount);
        }
    }
}
