using CarsAPI.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.handlers_and_commands;

public class DeletePartHandler(AppDbContext context) : IRequestHandler<DeletePart, bool>
{
    public async Task<bool> Handle(DeletePart request, CancellationToken cancellationToken)
    {
        var deleted = await context.Parts
            .Where(part => part.Id == request.Id)
            .ExecuteDeleteAsync(cancellationToken);

        return deleted > 0;
    }
}
