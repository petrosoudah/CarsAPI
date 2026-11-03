using CarsAPI.Models;
using MediatR;

namespace CarsAPI.handlers_and_commands;

public record GetCarsByMake(string Make, int PageNumber, int PageSize)
    : IRequest<CarsAPI.Data.PagedResult<Cars>>;
