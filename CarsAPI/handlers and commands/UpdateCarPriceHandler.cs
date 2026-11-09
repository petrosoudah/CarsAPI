using CarsAPI.Data;
using CarsAPI.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.handlers_and_commands;

public class UpdateCarPriceHandler(AppDbContext context)
    : IRequestHandler<UpdateCarPrice, int>
{
    public async Task<int> Handle(
        UpdateCarPrice request,
        CancellationToken cancellationToken)
    {
        var car = await context.Cars.FindAsync([request.CarId], cancellationToken);
        if (car == null)
        {
            return 0;
        }

        car.ChangePrice(request.NewPrice);

        return await context.SaveChangesAsync(cancellationToken);
    }
}