using Basket.Domain.Entities;
using Common.Behaviors; // BuildingBlocks
using MediatR;

namespace Basket.Application.Queries.GetBasket;

public record GetBasketQuery(string UserName) : IRequest<Result<ShoppingCart>>;