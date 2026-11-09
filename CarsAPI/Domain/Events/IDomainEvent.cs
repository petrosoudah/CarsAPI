namespace CarsAPI.Domain.Events;

public interface IDomainEvent : MediatR.INotification
{
    DateTime OccurredAt { get; }
}
