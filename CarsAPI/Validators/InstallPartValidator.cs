using CarsAPI.handlers_and_commands;
using FluentValidation;

namespace CarsAPI.Validators;

public class InstallPartValidator : AbstractValidator<InstallPart>
{
    public InstallPartValidator()
    {
        RuleFor(x => x.CarId).GreaterThan(0);
        RuleFor(x => x.Manufacturer).NotEmpty();
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
    }
}