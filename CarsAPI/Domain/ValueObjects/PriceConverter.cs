using CarsAPI.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace CarsAPI.Domain.ValueObjects;

public class PriceConverter : ValueConverter<Price?, decimal?>
{
    public PriceConverter() : base(
        v => v.HasValue ? v.Value.Amount : (decimal?)null,
        v => v.HasValue ? Price.Create(v.Value) : null)
    {
    }
}

public class NonNullablePriceConverter : ValueConverter<Price, decimal>
{
    public NonNullablePriceConverter() : base(
        v => v.Amount,
        v => Price.Create(v))
    {
    }
}