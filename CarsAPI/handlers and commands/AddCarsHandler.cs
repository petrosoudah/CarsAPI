using CarsAPI.Data;
using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public class AddCarsHandler(AppDbContext context) : IRequestHandler<AddCars, CarsAPI.Models.Cars>
    {
        public async Task<CarsAPI.Models.Cars> Handle(AddCars request, CancellationToken cancellationToken)
        {
            var car = new CarsAPI.Models.Cars
            {
                Make = request.Make,
                Model = request.Model,
                Year = request.Year,
                Horsepower = request.Horsepower,
                Price = request.Price,
                IsAvailable = request.IsAvailable,
                Color = request.Color
            };
            await context.Cars.AddAsync(car, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            return car;

        }
    }
}
