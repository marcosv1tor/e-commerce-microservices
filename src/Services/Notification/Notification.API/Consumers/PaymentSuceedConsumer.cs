using EventBus;
using MassTransit;

namespace Notification.API.Consumers
{
    public class PaymentSuceedConsumer : IConsumer<OrderPaymentSucceededIntegrationEvent>
    {
        private readonly ILogger<PaymentSuceedConsumer> _logger;

        public PaymentSuceedConsumer(ILogger<PaymentSuceedConsumer> logger)
        {
            _logger = logger;
        }

        public Task Consume(ConsumeContext<OrderPaymentSucceededIntegrationEvent> context)
        {
            // Simula envio de email
            _logger.LogInformation("📧 [NOTIFICAÇÃO] O pagamento do pedido {OrderId} foi aprovado! Email de confirmação enviado.", context.Message.OrderId);
            return Task.CompletedTask;
        }
    }
}
