using EventBus;
using MassTransit;

namespace Payment.API.Consumers;

public class OrderCreatedConsumer : IConsumer<OrderCreatedIntegrationEvent>
{
    private readonly ILogger<OrderCreatedConsumer> _logger;
    private readonly IPublishEndpoint _publishEndpoint;

    public OrderCreatedConsumer(ILogger<OrderCreatedConsumer> logger, IPublishEndpoint publishEndpoint)
    {
        _logger = logger;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Consume(ConsumeContext<OrderCreatedIntegrationEvent> context)
    {
        _logger.LogInformation("💳 Processando pagamento para o Pedido: {OrderId} do usuário {UserName}", context.Message.Id, context.Message.UserName);

        // SIMULAÇÃO DE PROCESSAMENTO (Delay de 2s)
        await Task.Delay(2000);

        // Lógica Mock: Aqui você integraria com Stripe/PayPal.
        // Vamos assumir sucesso sempre por enquanto.
        bool paymentSuccess = true;

        if (paymentSuccess)
        {
            _logger.LogInformation("✅ Pagamento Aprovado para o Pedido: {OrderId}", context.Message.Id);

            // Avisa o mundo que deu certo
            await _publishEndpoint.Publish(new OrderPaymentSucceededIntegrationEvent(context.Message.Id));
        }
        else
        {
            _logger.LogError("❌ Pagamento Recusado para o Pedido: {OrderId}", context.Message.Id);

            // Avisa o mundo que falhou
            await _publishEndpoint.Publish(new OrderPaymentFailedIntegrationEvent(context.Message.Id, "Saldo insuficiente (Mock)"));
        }
    }
}