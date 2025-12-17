using Basket.Domain.Entities;
using Common.Behaviors;
using MediatR;

// O comando recebe o objeto carrinho inteiro (é mais simples para API stateless)
public record UpdateBasketCommand(ShoppingCart Basket) : IRequest<Result<ShoppingCart>>;