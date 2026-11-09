using CarsAPI.Domain.ValueObjects;
using CarsAPI.handlers_and_commands;
using FluentValidation;

namespace CarsAPI.Validators
{
    public class UpdateCarValidator : AbstractValidator<UpdateCar>
    {
        public UpdateCarValidator()
        {
            RuleFor(x => x.Make)
                .NotEmpty().WithMessage("Make is required.")
                .MaximumLength(50).WithMessage("Make cannot exceed 50 characters.");
            RuleFor(x => x.Model)
                .NotEmpty().WithMessage("Model is required.")
                .MaximumLength(50).WithMessage("Model cannot exceed 50 characters.");
            RuleFor(x => x.Year)
                .Must(y => y.Value >= Year.MinYear && y.Value <= Year.MaxYear)
                .WithMessage($"Year must be between {Year.MinYear} and {Year.MaxYear}.");
            RuleFor(x => x.Horsepower)
                .Must(h => h.Value > 0).WithMessage("Horsepower must be greater than 0.");
            RuleFor(x => x.Price)
                .Must(p => !p.HasValue || p.Value.Amount >= 0).WithMessage("Price must be greater than or equal to 0 if provided.");
            RuleFor(x => x.Color)
                .MaximumLength(30).When(x => !string.IsNullOrEmpty(x.Color)).WithMessage("Color cannot exceed 30 characters.");
        }
    }
}
