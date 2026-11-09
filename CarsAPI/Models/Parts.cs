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
        public Price Price { get; set; }

        // OData-compatible decimal price (exposes Price.Amount for OData $select, $filter)
        [JsonIgnore]
        [NotMapped]
        public decimal PriceAmount => Price.Amount;

        public int? CarId { get; set; }

        public Cars? Car { get; set; }
    }
}
