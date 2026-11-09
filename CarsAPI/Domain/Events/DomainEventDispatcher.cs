using CarsAPI.Domain.Common;
using MediatR;

namespace CarsAPI.Domain.Events;

public class DomainEventDispatcher(IPublisher publisher)
{
    public async Task DispatchAsync(Entity entity, CancellationToken cancellationToken = default)
    {
        var events = entity.DomainEvents.ToArray();
        if (events.Length == 0) return;

        entity.ClearDomainEvents();

        foreach (var domainEvent in events)
        {
            await publisher.Publish(domainEvent, cancellationToken);
        }
    }

    public async Task DispatchAsync(IEnumerable<Entity> entities, CancellationToken cancellationToken = default)
    {
        foreach (var entity in entities)
        {
            await DispatchAsync(entity, cancellationToken);
        }
    }
}