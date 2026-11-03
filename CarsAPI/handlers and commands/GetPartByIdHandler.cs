using CarsAPI.Data;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public class GetPartByIdHandler (AppDbContext context) : IRequestHandler<GetPartById, CarsAPI.Models.Parts>
    {
        public async Task<CarsAPI.Models.Parts> Handle(GetPartById request, CancellationToken cancellationToken)
        {
            var part = await context.Parts.FindAsync(request.Id);
            if (part == null)
            {
                throw new KeyNotFoundException($"Part with ID {request.Id} not found.");
            }
            return part;
        }
    }
}
