using CarsAPI.handlers_and_commands;
using FluentValidation;
using System.Data;

namespace CarsAPI.Validators
{
    public class AddCarsValidator : AbstractValidator<AddCars>
    {
        public AddCarsValidator()
        {
            RuleFor(x => x.Make)
                .NotEmpty().WithMessage("Make is required.")
                .MaximumLength(50).WithMessage("Make cannot exceed 50 characters.");
            RuleFor(x => x.Model)
                .NotEmpty().WithMessage("Model is required.")
                .MaximumLength(50).WithMessage("Model cannot exceed 50 characters.");
            RuleFor(x => x.Year)
                .InclusiveBetween(1886, DateTime.Now.Year + 1).WithMessage($"Year must be between 1886 and {DateTime.Now.Year + 1}.");
            RuleFor(x => x.Horsepower)
                .GreaterThan(0).WithMessage("Horsepower must be greater than 0.");
            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0).When(x => x.Price.HasValue).WithMessage("Price must be greater than or equal to 0 if provided.");
            RuleFor(x => x.Color)
                .MaximumLength(30).When(x => !string.IsNullOrEmpty(x.Color)).WithMessage("Color cannot exceed 30 characters.");
        }
    }
}
