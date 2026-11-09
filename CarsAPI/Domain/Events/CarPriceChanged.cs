using CarsAPI.Domain.ValueObjects;

namespace CarsAPI.Domain.Events;

public record CarPriceChanged(
    int CarId,
    Price? OldPrice,
    Price NewPrice
) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}