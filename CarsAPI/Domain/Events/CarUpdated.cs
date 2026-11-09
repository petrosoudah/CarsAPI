using CarsAPI.Domain.ValueObjects;

namespace CarsAPI.Domain.Events;

public record CarUpdated(
    int CarId,
    string Make,
    string Model,
    Year Year,
    Horsepower Horsepower,
    Price? Price,
    string? Color
) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}