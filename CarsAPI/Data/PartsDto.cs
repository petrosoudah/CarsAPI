namespace CarsAPI.Data
{
    public class PartsDto
    {
        public Guid Id { get; set; }
        public string Manufacturer { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int? CarId { get; set; }
        public string? CarName { get; set; }
    }
}
