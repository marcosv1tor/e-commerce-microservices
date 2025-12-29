using EventBus;
using MassTransit;
using Order.Domain.Interfaces;

namespace Order.API.Consumers
{
    public class OrderPaymentSucceededConsumer : IConsumer<OrderPaymentSucceededIntegrationEvent>
    {
        private readonly IOrderRepository _repository;

        public OrderPaymentSucceededConsumer(IOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task Consume(ConsumeContext<OrderPaymentSucceededIntegrationEvent> context)
        {
            var order = await _repository.GetByIdAsync(context.Message.OrderId.ToString());

            if (order != null)
            {
                order.SetPaidStatus();
                await _repository.UpdateAsync(order);
            }
        }
    }
}
