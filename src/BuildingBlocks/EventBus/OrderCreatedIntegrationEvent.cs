namespace EventBus;

// Este é o contrato que o Order envia e o Basket recebe
public record OrderCreatedIntegrationEvent(string OrderId, string UserName) : IntegrationEvent;