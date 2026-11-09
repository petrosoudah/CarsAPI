namespace CarsAPI.Domain.ValueObjects;

public readonly record struct Horsepower
{
    public int Value { get; }

    private Horsepower(int value)
    {
        Value = value;
    }

    public static Horsepower Create(int value)
    {
        if (value <= 0)
            throw new ArgumentException("Horsepower must be greater than 0", nameof(value));
        if (value > int.MaxValue)
            throw new ArgumentException("Horsepower exceeds maximum allowed value", nameof(value));
        return new Horsepower(value);
    }

    public static implicit operator int(Horsepower hp) => hp.Value;
    public static implicit operator Horsepower(int value) => Create(value);

    public override string ToString() => Value.ToString();
}