using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CarsAPI.Domain.ValueObjects;
using System.Text.Json.Serialization;

namespace CarsAPI.Models
{
    public class Parts
    {
        [Key]
        public Guid Id { get; set; }

        public string Manufacturer { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [NotMapped]
        public Price Price { get; set; }

        [JsonIgnore]
        public decimal PriceAmount
        {
            get => Price.Amount;
            private set => Price = Price.Create(value);
        }

        public int? CarId { get; set; }

        public Cars? Car { get; set; }
    }
}
