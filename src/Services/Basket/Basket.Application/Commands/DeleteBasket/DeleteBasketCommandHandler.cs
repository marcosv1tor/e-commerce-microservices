using Basket.Domain.Interfaces;
using Common.Behaviors;
using MediatR;

namespace Basket.Application.Commands.DeleteBasket;

public class DeleteBasketCommandHandler : IRequestHandler<DeleteBasketCommand, Result<bool>>
{
    private readonly IBasketRepository _repository;

    public DeleteBasketCommandHandler(IBasketRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteBasketCommand request, CancellationToken cancellationToken)
    {
        await _repository.DeleteBasketAsync(request.UserName);
        return Result<bool>.Success(true);
    }
}