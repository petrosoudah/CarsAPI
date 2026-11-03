using CarsAPI.Data;
using CarsAPI.handlers_and_commands;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CarsAPI.Validators;

public sealed class AddPartsValidator : AbstractValidator<AddParts>
{
    public AddPartsValidator(AppDbContext context)
    {
        RuleFor(part => part.Manufacturer)
            .NotEmpty().WithMessage("Manufacturer is required.")
            .MaximumLength(100).WithMessage("Manufacturer cannot exceed 100 characters.");
        RuleFor(part => part.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");
        RuleFor(part => part.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to 0.");
        RuleFor(part => part.CarId)
            .Must(carId => !carId.HasValue || carId.Value > 0)
            .WithMessage("CarId must be greater than 0 when provided.")
            .MustAsync(async (carId, cancellationToken) =>
                !carId.HasValue || await context.Cars
                    .AnyAsync(car => car.Id == carId.Value, cancellationToken))
            .WithMessage("CarId must refer to an existing car.");
    }
}
