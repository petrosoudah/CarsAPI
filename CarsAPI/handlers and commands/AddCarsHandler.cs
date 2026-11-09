using CarsAPI.Data;
using CarsAPI.Domain.ValueObjects;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public class AddCarsHandler(AppDbContext context) : IRequestHandler<AddCars, CarsAPI.Models.Cars>
    {
        public async Task<CarsAPI.Models.Cars> Handle(AddCars request, CancellationToken cancellationToken)
        {
            var car = CarsAPI.Models.Cars.Create(
                request.Make,
                request.Model,
                request.Year,
                request.Horsepower,
                request.Price,
                request.Color);

            // IsAvailable is handled by the factory (always true on creation)
            // But we can mark as unavailable if explicitly requested
            if (!request.IsAvailable)
            {
                car.MarkSold();
            }

            await context.Cars.AddAsync(car, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            return car;
        }
    }
}
