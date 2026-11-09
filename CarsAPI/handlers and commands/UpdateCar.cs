using CarsAPI.Domain.ValueObjects;
using MediatR;

namespace CarsAPI.handlers_and_commands;

public record UpdateCar(
    int Id,
    string Make,
    string Model,
    Year Year,
    Horsepower Horsepower,
    Price? Price,
    bool IsAvailable = true,
    string? Color = null
) : IRequest<CarsAPI.Models.Cars>;

