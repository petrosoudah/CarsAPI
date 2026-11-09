namespace CarsAPI.Domain.ValueObjects;

public readonly record struct Year
{
    public int Value { get; }

    private Year(int value)
    {
        Value = value;
    }

    public static int MinYear => 1886;
    public static int MaxYear => DateTime.UtcNow.Year + 1;

    public static Year Create(int value)
    {
        if (value < MinYear || value > MaxYear)
            throw new ArgumentException($"Year must be between {MinYear} and {MaxYear}", nameof(value));
        return new Year(value);
    }

    public static implicit operator int(Year year) => year.Value;
    public static implicit operator Year(int value) => Create(value);

    public override string ToString() => Value.ToString();
}