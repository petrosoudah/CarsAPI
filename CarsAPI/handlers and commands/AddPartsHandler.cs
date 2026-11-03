using CarsAPI.Data;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public class AddPartsHandler(AppDbContext context) : IRequestHandler<AddParts, CarsAPI.Models.Parts>
    {
        public async Task<CarsAPI.Models.Parts> Handle(AddParts request, CancellationToken cancellationToken)
        {
            var part = new CarsAPI.Models.Parts
            {
                Id = request.Id,
                Manufacturer = request.Manufacturer,
                Description = request.Description,
                Price = request.Price,
                CarId = request.CarId
            };
            context.Parts.Add(part);
            await context.SaveChangesAsync(cancellationToken);
            return part;
        }
    }
    
    }

