using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record GetPartById : IRequest<CarsAPI.Models.Parts>
    {
        public Guid Id { get; init; }
        public GetPartById(Guid id)
        {
            Id = id;
        }
    }
    
    }

