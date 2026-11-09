using CarsAPI.Data;
using CarsAPI.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.handlers_and_commands;

public class UpdateCarHandler(AppDbContext context) : IRequestHandler<UpdateCar, CarsAPI.Models.Cars>
{
    public async Task<CarsAPI.Models.Cars> Handle(UpdateCar request, CancellationToken cancellationToken)
    {
        var car = await context.Cars.FindAsync([request.Id], cancellationToken);
        if (car == null)
        {
            throw new KeyNotFoundException($"Car with ID {request.Id} not found.");
        }

        car.UpdateDetails(
            request.Make,
            request.Model,
            request.Year,
            request.Horsepower,
            request.Price,
            request.Color);

        // Handle availability separately
        if (request.IsAvailable && !car.IsAvailable)
        {
            car.MarkAvailable();
        }
        else if (!request.IsAvailable && car.IsAvailable)
        {
            car.MarkSold();
        }

        await context.SaveChangesAsync(cancellationToken);
        return car;
    }
}
