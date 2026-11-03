using CarsAPI.Data;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public class CarByIdHandler (AppDbContext context) : IRequestHandler<CarById, CarsAPI.Models.Cars>
    {
        public async Task<CarsAPI.Models.Cars> Handle(CarById request, CancellationToken cancellationToken)
        {
            var car = await context.Cars.FindAsync(new object[] { request.Id }, cancellationToken);
            if (car == null)
            {
                throw new KeyNotFoundException($"Car with ID {request.Id} not found.");
            }
            return car;
        }
    } 
    
    }

