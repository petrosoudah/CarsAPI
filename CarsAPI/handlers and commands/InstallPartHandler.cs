using CarsAPI.Data;
using CarsAPI.Domain.ValueObjects;
using CarsAPI.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.handlers_and_commands;

public class InstallPartHandler(AppDbContext context)
    : IRequestHandler<InstallPart, Guid?>
{
    public async Task<Guid?> Handle(
        InstallPart request,
        CancellationToken cancellationToken)
    {
        var car = await context.Cars
            .Include(c => c.Parts)
            .FirstOrDefaultAsync(c => c.Id == request.CarId, cancellationToken);

        if (car == null)
            return null;

        var part = new Parts
        {
            Manufacturer = request.Manufacturer,
            Description = request.Description,
            Price = request.Price.Amount,
            CarId = request.CarId
        };

        car.InstallPart(part);

        context.Parts.Add(part);
        await context.SaveChangesAsync(cancellationToken);

        return part.Id;
    }
}
