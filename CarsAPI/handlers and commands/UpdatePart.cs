using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record UpdatePart : IRequest<CarsAPI.Models.Parts>
    {
        public Guid Id { get; init; }
        public string Manufacturer { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public decimal Price { get; init; }

        public int? CarId { get; init; }
    }
}
