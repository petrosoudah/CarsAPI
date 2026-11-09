namespace CarsAPI.Domain.Events;

public record PartInstalled(
    int CarId,
    Guid PartId
) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}