using CarsAPI.Domain.ValueObjects;
using MediatR;

namespace CarsAPI.handlers_and_commands;

public record AddCars(
    string Make,
    string Model,
    int Year,
    int Horsepower,
    decimal? Price,
    bool IsAvailable = true,
    string? Color = null
) : IRequest<CarsAPI.Models.Cars>;
