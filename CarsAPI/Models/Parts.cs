using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarsAPI.Models
{
    public class Parts
    {
        [Key]
        public Guid Id { get; set; }

        public string Manufacturer { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        
        public int? CarId { get; set; }

        public Cars? Car { get; set; }
    }
}
