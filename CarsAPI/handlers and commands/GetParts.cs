using CarsAPI.Data;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record GetParts(int PageNumber, int PageSize)
        : IRequest<CarsAPI.Data.PagedResult<PartsDto>>;

    
}
