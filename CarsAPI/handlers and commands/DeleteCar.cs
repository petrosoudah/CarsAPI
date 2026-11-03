using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record DeleteCar : IRequest<bool>
    {
        public int Id { get; init; }

    }
}
