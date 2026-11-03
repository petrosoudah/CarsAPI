using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record ListCars(int PageNumber, int PageSize, string? Search = null, bool? IsAvailable = null)
        : IRequest<CarsAPI.Data.PagedResult<CarsAPI.Models.Cars>>;
}
