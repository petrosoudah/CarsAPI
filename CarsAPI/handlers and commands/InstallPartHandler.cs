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
        var car = await context.Cars
            .FirstOrDefaultAsync(
                c => c.Id == request.CarId,
                cancellationToken);

        if (car == null)
            return null;

        await using var transaction =
            await context.Database.BeginTransactionAsync(
                cancellationToken);

        try
        {
            var part = new Parts
            {
                Manufacturer = request.Manufacturer,
                Description = request.Description,
                Price = request.Price,
                CarId = request.CarId
            };

            context.Parts.Add(part);

            await context.SaveChangesAsync(cancellationToken);

            car.Price = (car.Price ?? 0m) + request.Price;

            await context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return part.Id;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}