using CarsAPI.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using CarsAPI.Exceptions;

namespace CarsAPI.handlers_and_commands
{
    public class DeleteCarHandler (AppDbContext context) : IRequestHandler<DeleteCar, bool>
    {
        public async Task<bool> Handle(DeleteCar request, CancellationToken cancellationToken)
        {
            var car = await context.Cars.FindAsync(new object[] { request.Id }, cancellationToken);
            if (car == null)
            {
                return false;
            }
            var hasParts = await context.Parts.AnyAsync(
                part => part.CarId == request.Id, cancellationToken
                );
            if (hasParts)
            {
                throw new ConflictException("This Car has assigned parts. Remove or unassign them first.");
            }
            context.Cars.Remove(car);
            await context.SaveChangesAsync(cancellationToken);
            return true;
        }
    
    }
}
