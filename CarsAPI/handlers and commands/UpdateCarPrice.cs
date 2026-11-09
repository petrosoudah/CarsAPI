using CarsAPI.Domain.ValueObjects;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record UpdateCarPrice(int CarId, Price NewPrice) : IRequest<int>;
}
