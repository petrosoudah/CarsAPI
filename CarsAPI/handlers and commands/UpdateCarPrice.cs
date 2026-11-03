using MediatR;

namespace CarsAPI.handlers_and_commands
{
    public record UpdateCarPrice(int CarId, decimal NewPrice) : IRequest<int>;
    
    
}
