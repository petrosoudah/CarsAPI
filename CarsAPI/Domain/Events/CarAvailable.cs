namespace CarsAPI.Domain.Events;

public record CarAvailable(
    int CarId
) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}