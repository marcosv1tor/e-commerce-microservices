using Basket.Domain.Interfaces;
using Basket.Domain.Entities;
using Common.Behaviors;
using MediatR;

namespace Basket.Application.Commands.UpdateBasket;

public class UpdateBasketCommandHandler : IRequestHandler<UpdateBasketCommand, Result<ShoppingCart>>
{
    private readonly IBasketRepository _repository;

    public UpdateBasketCommandHandler(IBasketRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ShoppingCart>> Handle(UpdateBasketCommand request, CancellationToken cancellationToken)
    {
        // Aqui poderíamos validar se os produtos existem no Catálogo (chamada gRPC ou HTTP),
        // mas por enquanto vamos confiar no front-end enviando os dados corretos.

        var updatedBasket = await _repository.UpdateBasketAsync(request.Basket);

        return Result<ShoppingCart>.Success(updatedBasket!);
    }
}