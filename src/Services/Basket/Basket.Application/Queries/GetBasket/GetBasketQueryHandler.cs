using Basket.Domain.Entities;
using Basket.Domain.Interfaces;
using Common.Behaviors;
using MediatR;

namespace Basket.Application.Queries.GetBasket;

public class GetBasketQueryHandler : IRequestHandler<GetBasketQuery, Result<ShoppingCart>>
{
    private readonly IBasketRepository _repository;

    public GetBasketQueryHandler(IBasketRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ShoppingCart>> Handle(GetBasketQuery request, CancellationToken cancellationToken)
    {
        var basket = await _repository.GetBasketAsync(request.UserName);

        // Se não existir carrinho, retornamos um novo vazio (padrão de e-commerce)
        // Isso evita erros no front-end
        return Result<ShoppingCart>.Success(basket ?? new ShoppingCart(request.UserName));
    }
}