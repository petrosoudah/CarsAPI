using MediatR;

namespace CarsAPI.handlers_and_commands;

public record CarById(int Id) : IRequest<CarsAPI.Models.Cars>;

