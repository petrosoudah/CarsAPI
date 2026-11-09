using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using CarsAPI.Domain.Common;
using CarsAPI.Domain.Events;
using CarsAPI.Domain.ValueObjects;

namespace CarsAPI.Models;

public class Cars : Entity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string Make { get; private set; } = string.Empty;
    public string Model { get; private set; } = string.Empty;
    [NotMapped]
    public Year Year { get; private set; }
    [NotMapped]
    public Horsepower Horsepower { get; private set; }
    [NotMapped]
    public Price? Price { get; private set; }
    public bool IsAvailable { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public string? Color { get; private set; }

    [JsonIgnore]
    public ICollection<Parts> Parts { get; private set; } = new List<Parts>();

    // EF and OData use primitive properties backed by the domain values.
    [JsonIgnore]
    public int YearValue
    {
        get => Year.Value;
        private set => Year = Year.Create(value);
    }

    [JsonIgnore]
    public int HorsepowerValue
    {
        get => Horsepower.Value;
        private set => Horsepower = Horsepower.Create(value);
    }

    [JsonIgnore]
    public decimal? PriceAmount
    {
        get => Price?.Amount;
        private set => Price = value is decimal amount
            ? CarsAPI.Domain.ValueObjects.Price.Create(amount)
            : null;
    }

    // EF Core requires parameterless constructor
    private Cars() { }

    // Factory method
    public static Cars Create(
        string make,
        string model,
        Year year,
        Horsepower horsepower,
        Price? price,
        string? color = null)
    {
        var car = new Cars
        {
            Make = make,
            Model = model,
            Year = year,
            Horsepower = horsepower,
            Price = price,
            Color = color,
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        };

        car.AddDomainEvent(new CarCreated(
            car.Id, make, model, year, horsepower, price, color));

        return car;
    }

    // Domain methods
    public void UpdateDetails(
        string make,
        string model,
        Year year,
        Horsepower horsepower,
        Price? price,
        string? color)
    {
        Make = make;
        Model = model;
        Year = year;
        Horsepower = horsepower;
        Price = price;
        Color = color;

        AddDomainEvent(new CarUpdated(Id, make, model, year, horsepower, price, color));
    }

    public void ChangePrice(Price newPrice)
    {
        var oldPrice = Price;
        Price = newPrice;

        AddDomainEvent(new CarPriceChanged(Id, oldPrice, newPrice));
    }

    public void MarkSold()
    {
        if (!IsAvailable)
            throw new InvalidOperationException("Car is already sold.");

        IsAvailable = false;
        AddDomainEvent(new CarSold(Id));
    }

    public void MarkAvailable()
    {
        if (IsAvailable)
            throw new InvalidOperationException("Car is already available.");

        IsAvailable = true;
        AddDomainEvent(new CarAvailable(Id));
    }

    public void InstallPart(Parts part)
    {
        if (Parts.Any(p => p.Id == part.Id))
            return;

        Parts.Add(part);
        AddDomainEvent(new PartInstalled(Id, part.Id));
    }
}
