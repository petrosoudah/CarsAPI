using CarsAPI.Models;
using CarsAPI.Domain.Common;
using CarsAPI.Domain.Events;
using CarsAPI.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.Data
{
    public class AppDbContext : DbContext
    {
        private readonly DomainEventDispatcher _domainEventDispatcher;

        public AppDbContext(
            DbContextOptions<AppDbContext> options,
            DomainEventDispatcher domainEventDispatcher) : base(options)
        {
            _domainEventDispatcher = domainEventDispatcher;
        }
        public DbSet<CarsAPI.Models.Cars> Cars { get; set; }
        public DbSet<CarsAPI.Models.Parts> Parts { get; set; }
        public DbSet<CarsAPI.Models.CarPartsView> CarPartsView { get; set; }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entitiesWithEvents = ChangeTracker.Entries<Entity>()
                .Where(e => e.Entity.DomainEvents.Any())
                .Select(e => e.Entity)
                .ToList();

            var result = await base.SaveChangesAsync(cancellationToken);

            if (entitiesWithEvents.Count > 0)
            {
                await _domainEventDispatcher.DispatchAsync(entitiesWithEvents, cancellationToken);
            }

            return result;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Cars>()
                .Property(c => c.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Cars>()
                .Property(c => c.IsAvailable)
                .HasDefaultValue(true);

            modelBuilder.Entity<Cars>()
                .Property(c => c.Price)
                .HasConversion(new PriceConverter())
                .HasPrecision(18, 2);

            modelBuilder.Entity<Cars>()
                .Property(c => c.Year)
                .HasConversion(new YearConverter());

            modelBuilder.Entity<Cars>()
                .Property(c => c.Horsepower)
                .HasConversion(new HorsepowerConverter());

            modelBuilder.Entity<CarPartsView>(entity =>
            {
                entity.HasNoKey();
                entity.ToView("CarPartsView");
            });
            modelBuilder.Entity<Parts>()
                .Property(p => p.Id)
                .HasDefaultValueSql("NEWID()");
            modelBuilder.Entity<Parts>()
                .Property(p => p.Price)
                .HasConversion(new NonNullablePriceConverter())
                .HasPrecision(18, 2);

            modelBuilder.Entity<CarPartsView>()
                .Property(v => v.Price)
                .HasPrecision(18, 2);
        }
    }
}
    
