using CarsAPI.Models;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record GetCarPartsView(int PageNumber, int PageSize)
        : IRequest<CarsAPI.Data.PagedResult<CarPartsView>>;
}
