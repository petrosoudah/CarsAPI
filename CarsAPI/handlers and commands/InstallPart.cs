using CarsAPI.Domain.ValueObjects;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record InstallPart(
        int CarId,
        string Manufacturer,
        string Description,
        Price Price
    ) : IRequest<Guid?>;
}
