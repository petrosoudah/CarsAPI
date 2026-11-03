using CarsAPI.Models;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record GetCarByYear(int Year, int PageNumber, int PageSize)
        : IRequest<CarsAPI.Data.PagedResult<Cars>>;
    
    
}
