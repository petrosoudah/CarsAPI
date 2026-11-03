using MediatR;

namespace CarsAPI.handlers_and_commands;

public record DeletePart(Guid Id) : IRequest<bool>;
