using Common.Behaviors;
using MediatR;
using Order.Domain.Interfaces;
using MassTransit;
using EventBus;

namespace Order.Application.Commands.CheckoutOrder;

public class CheckoutOrderCommandHandler : IRequestHandler<CheckoutOrderCommand, Result<string>>
{
    private readonly IOrderRepository _repository;
    private readonly IPublishEndpoint _publishEndpoint;

    public CheckoutOrderCommandHandler(IOrderRepository repository, IPublishEndpoint publishEndpoint)
    {
        _repository = repository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<string>> Handle(CheckoutOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Criar o Agregado Raiz (Pedido)
        var order = new Domain.Entities.Order(
            request.BuyerId,
            request.UserName,
            request.ShippingAddress
        );

        // 2. Adicionar os Itens
        // Aqui usamos o método de domínio AddOrderItem que criamos antes.
        // Ele garante que não duplicamos itens, apenas somamos quantidade se já existir.
        foreach (var item in request.Items)
        {
            order.AddOrderItem(
                item.ProductId,
                item.ProductName,
                item.PictureUrl,
                item.UnitPrice,
                item.Units
            );
        }

        // 3. Persistir
        await _repository.AddAsync(order);
        // Isso avisa o RabbitMQ: "Alguém comprou! O usuário foi X"
        // ⬇️ ADICIONE ESTE LOG
        Console.WriteLine($"🚀 PUBLICANDO EVENTO para userName: {request.UserName}");

        var eventMessage = new OrderCreatedIntegrationEvent(order.Id, request.UserName);
        await _publishEndpoint.Publish(eventMessage, cancellationToken);

        // ⬇️ ADICIONE ESTE LOG TAMBÉM
        Console.WriteLine($"✅ EVENTO PUBLICADO com sucesso!");

        // 4. Retornar o ID
        return Result<string>.Success(order.Id);
    }
}