using CarsAPI.Data;
using MediatR;

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
            context.Cars.Remove(car);
            await context.SaveChangesAsync(cancellationToken);
            return true;
        }
    
    }
}
