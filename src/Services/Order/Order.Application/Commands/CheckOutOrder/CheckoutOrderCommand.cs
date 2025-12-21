using Common.Behaviors;
using MediatR;
using Order.Application.DTOs;
using Order.Domain.ValueObjects;

namespace Order.Application.Commands.CheckoutOrder;

public record CheckoutOrderCommand(
    string BuyerId,
    string UserName,
    Address ShippingAddress, // Usamos o ValueObject direto aqui para facilitar
    List<OrderItemDto> Items
) : IRequest<Result<string>>; // Retorna o ID do Pedido gerado