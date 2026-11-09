using CarsAPI.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace CarsAPI.Domain.ValueObjects;

public class YearConverter : ValueConverter<Year, int>
{
    public YearConverter() : base(
        v => v.Value,
        v => Year.Create(v))
    {
    }
}