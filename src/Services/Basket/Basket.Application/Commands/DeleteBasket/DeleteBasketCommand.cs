using Common.Behaviors;
using MediatR;

public record DeleteBasketCommand(string UserName) : IRequest<Result<bool>>;