using CarsAPI.Data;
using CarsAPI.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.handlers_and_commands;

public class UpdatePartHandler(AppDbContext context) : IRequestHandler<UpdatePart, CarsAPI.Models.Parts>
{
    public async Task<CarsAPI.Models.Parts> Handle(UpdatePart request, CancellationToken cancellationToken)
    {
        var part = await context.Parts.FindAsync([request.Id], cancellationToken);
        if (part == null)
        {
            throw new KeyNotFoundException($"Part with ID {request.Id} not found.");
        }
        part.Manufacturer = request.Manufacturer;
        part.Description = request.Description;
        part.Price = request.Price.Amount;
        part.CarId = request.CarId;
        await context.SaveChangesAsync(cancellationToken);
        return part;
    }
}
