using CarsAPI.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace CarsAPI.Domain.ValueObjects;

public class HorsepowerConverter : ValueConverter<Horsepower, int>
{
    public HorsepowerConverter() : base(
        v => v.Value,
        v => Horsepower.Create(v))
    {
    }
}