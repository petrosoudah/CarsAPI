namespace CarsAPI.Domain.ValueObjects;

public readonly record struct Price
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Price(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public static Price Zero => new(0, "USD");

    public static Price Create(decimal amount, string currency = "USD")
    {
        if (amount < 0)
            throw new ArgumentException("Price cannot be negative", nameof(amount));
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency is required", nameof(currency));

        return new Price(Math.Round(amount, 2, MidpointRounding.AwayFromZero), currency.ToUpperInvariant());
    }

    public static Price Create(decimal? amount, string currency = "USD")
        => amount.HasValue ? Create(amount.Value, currency) : Zero;

    public static implicit operator decimal(Price price) => price.Amount;

    public static implicit operator Price(decimal amount) => Create(amount);

    public Price Add(Price other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot add prices with different currencies: {Currency} vs {other.Currency}");
        return Create(Amount + other.Amount, Currency);
    }

    public Price Subtract(Price other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot subtract prices with different currencies: {Currency} vs {other.Currency}");
        return Create(Amount - other.Amount, Currency);
    }

    public Price Multiply(decimal factor) => Create(Amount * factor, Currency);

    public int CompareTo(Price other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot compare prices with different currencies: {Currency} vs {other.Currency}");
        return Amount.CompareTo(other.Amount);
    }

    public static bool operator <(Price left, Price right) => left.CompareTo(right) < 0;
    public static bool operator >(Price left, Price right) => left.CompareTo(right) > 0;
    public static bool operator <=(Price left, Price right) => left.CompareTo(right) <= 0;
    public static bool operator >=(Price left, Price right) => left.CompareTo(right) >= 0;

    public override string ToString() => $"{Amount:N2} {Currency}";
}