using CarsAPI.Domain.ValueObjects;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record AddParts : IRequest<CarsAPI.Models.Parts>
    {
        public Guid Id = Guid.NewGuid();
        public string Manufacturer { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Price Price { get; set; }
        public int? CarId { get; set; }
    }
}
