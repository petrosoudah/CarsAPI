namespace CarsAPI.Domain.Events;

public record CarSold(
    int CarId
) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}