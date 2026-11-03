using MediatR;
using CarsAPI.Data;
namespace CarsAPI.handlers_and_commands
{
    public class UpdateCarHandler : IRequestHandler<UpdateCar, CarsAPI.Models.Cars>
    {
        private readonly CarsAPI.Data.AppDbContext _context;
        public UpdateCarHandler(CarsAPI.Data.AppDbContext context)
        {
            _context = context;
        }
        public async Task<CarsAPI.Models.Cars> Handle(UpdateCar request, CancellationToken cancellationToken)
        {
            var car = await _context.Cars.FindAsync(
     new object[] { request.Id },
     cancellationToken);
            if (car == null)
            {
                throw new KeyNotFoundException($"Car with ID {request.Id} not found.");
            }
            car.Make = request.Make;
            car.Model = request.Model;
            car.Year = request.Year;
            car.Horsepower = request.Horsepower;
            car.Price = request.Price;
            car.IsAvailable = request.IsAvailable;
            car.Color = request.Color;
            await _context.SaveChangesAsync(cancellationToken);
            return car;
        }
    }
}
