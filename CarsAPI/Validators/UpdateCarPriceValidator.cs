using CarsAPI.handlers_and_commands;
using FluentValidation;

namespace CarsAPI.Validators;

public sealed class UpdateCarPriceValidator : AbstractValidator<UpdateCarPrice>
{
    public UpdateCarPriceValidator()
    {
        RuleFor(request => request.CarId)
            .GreaterThan(0).WithMessage("Car ID must be greater than 0.");
        RuleFor(request => request.NewPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to 0.");
    }
}
