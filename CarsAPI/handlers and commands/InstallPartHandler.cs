using CarsAPI.Data;
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
        var carExists = await context.Cars
            .AnyAsync(
                c => c.Id == request.CarId,
                cancellationToken);

        if (!carExists)
            return null;

        var part = new Parts
        {
            Manufacturer = request.Manufacturer,
            Description = request.Description,
            Price = request.Price,
            CarId = request.CarId
        };

        context.Parts.Add(part);
        await context.SaveChangesAsync(cancellationToken);

        return part.Id;
    }
}
