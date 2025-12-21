using Basket.Domain.Interfaces;
using EventBus;
using MassTransit;

namespace Basket.API.Consumers.cs
{
    public class OrderCreatedConsumer : IConsumer<OrderCreatedIntegrationEvent>
    {
        private readonly IBasketRepository _repository;
        private readonly ILogger<OrderCreatedConsumer> _logger;

        public OrderCreatedConsumer(IBasketRepository repository, ILogger<OrderCreatedConsumer> logger) 
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<OrderCreatedIntegrationEvent> context)
        {
            _logger.LogInformation($"🐇 Mensagem Recebida! Apagando carrinho do usuário: {context.Message.UserName}");

            // ⬇️ ADICIONE ESTE LOG
            _logger.LogInformation($"🗑️ ANTES de deletar - UserName: {context.Message.UserName}");

            await _repository.DeleteBasketAsync(context.Message.UserName);

            // ⬇️ ADICIONE ESTE LOG
            _logger.LogInformation($"✅ DEPOIS de deletar - Carrinho removido!");
        }
    }
}
