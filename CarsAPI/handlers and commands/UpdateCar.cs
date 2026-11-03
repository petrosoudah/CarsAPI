using MediatR;

namespace CarsAPI.handlers_and_commands;    

    public record UpdateCar : IRequest<CarsAPI.Models.Cars>
{
    public int Id { get; init; }
    public string Make { get; init; } = string.Empty;
    public string Model { get; init; }= string.Empty;
    public int Year { get; init; }
    public int Horsepower { get; init; }
    public decimal? Price { get; init; }
    public bool IsAvailable { get; init; } = true;
    public string? Color { get; init; }
}

