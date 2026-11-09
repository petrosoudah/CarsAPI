using CarsAPI.Data;
using CarsAPI.Models;
using CarsAPI.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using System.Transactions;

namespace CarsAPI.Learning;

public static class TransactionScopeDemo
{
    public static async Task<int> RunAsync(
        AppDbContext context,
        bool simulateFailure,
        CancellationToken cancellationToken)
    {
        var car = Cars.Create(
            "ScopeDemo",
            simulateFailure ? "RollbackTest" : "CommitTest",
            Year.Create(DateTime.UtcNow.Year),
            Horsepower.Create(100),
            Price.Create(1000));

        try
        {
            using (var scope = new TransactionScope(
                TransactionScopeAsyncFlowOption.Enabled))
            {
                var transaction = Transaction.Current
                ?? throw new InvalidOperationException("No active transaction found.");

                transaction.EnlistVolatile(
                    new TransactionPhaseLogger(),
                    EnlistmentOptions.None);
                await context.Database.OpenConnectionAsync(
                    cancellationToken);

                context.Cars.Add(car);
                await context.SaveChangesAsync(cancellationToken);

                var part = new Parts
                {
                    Id = Guid.NewGuid(),
                    Manufacturer = "ScopeDemo",
                    Description = "Transaction Test",
                    Price = 50,
                    CarId = car.Id
                };
                context.Parts.Add(part);
                await context.SaveChangesAsync(cancellationToken);

                if (simulateFailure)
                {
                    throw new InvalidOperationException(
                        "Intentional failure for rollback practice.");
                }

                scope.Complete();
            }
        }
        finally
        {
            await context.Database.CloseConnectionAsync();
        }

        return car.Id;
    }
}