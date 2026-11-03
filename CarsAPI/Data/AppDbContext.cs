using CarsAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<CarsAPI.Models.Cars> Cars { get; set; }
        public DbSet<CarsAPI.Models.Parts> Parts { get; set; }
        public DbSet<CarsAPI.Models.CarPartsView> CarPartsView { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Cars>()
                .Property(c => c.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Cars>()
                .Property(c => c.IsAvailable)
                .HasDefaultValue(true);

            modelBuilder.Entity<CarPartsView>(entity =>
            {
                entity.HasNoKey();
                entity.ToView("CarPartsView");
            });
            modelBuilder.Entity<Parts>()
                .Property(p => p.Id)
                .HasDefaultValueSql("NEWID()");
            modelBuilder.Entity<Cars>()
    .Property(c => c.Price)
    .HasPrecision(18, 2);

            modelBuilder.Entity<Parts>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<CarPartsView>()
                .Property(v => v.Price)
                .HasPrecision(18, 2);
        }
    }
}
    
