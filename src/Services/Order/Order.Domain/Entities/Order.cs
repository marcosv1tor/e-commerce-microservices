using Common.DDD;
using Order.Domain.ValueObjects;

namespace Order.Domain.Entities;

// Enum simples para status
public enum OrderStatus
{
    Realizado = 1,
    Aguardando_Validacao = 2,
    Em_Estoque = 3,
    Pago = 4,
    Enviado = 5,
    Cancelado = 6
}

public class Order : AggregateRoot
{
    public DateTime OrderDate { get; private set; }
    public string BuyerId { get; private set; } // ID do usuário que comprou
    public string UserName { get; private set; } // Nome para facilitar busca
    public OrderStatus Status { get; private set; }
    public Address Address { get; private set; } // Value Object

    // Lista de itens encapsulada
    private List<OrderItem> _orderItems = new();
    public IReadOnlyCollection<OrderItem> OrderItems => _orderItems;

    public decimal TotalPrice => _orderItems.Sum(o => o.Units * o.UnitPrice);

    protected Order() { }

    public Order(string buyerId, string userName, Address address)
    {
        Id = Guid.NewGuid().ToString();
        BuyerId = buyerId;
        UserName = userName;
        Address = address;
        Status = OrderStatus.Realizado;
        OrderDate = DateTime.UtcNow;
    }

    // Método de Negócio: Adicionar Item
    public void AddOrderItem(string productId, string productName, string pictureUrl, decimal unitPrice, int units)
    {
        // Verifica se o item já existe no pedido
        var existingOrderForProduct = _orderItems.SingleOrDefault(o => o.ProductId == productId);

        if (existingOrderForProduct != null)
        {
            // Se já existe, só aumenta a quantidade
            existingOrderForProduct.AddUnits(units);
        }
        else
        {
            // Se não, cria um novo item
            var orderItem = new OrderItem(productId, productName, pictureUrl, unitPrice, units);
            _orderItems.Add(orderItem);
        }
    }

    // Métodos para mudar status (State Machine simples)
    public void SetPaidStatus()
    {
        if (Status == OrderStatus.Realizado)
        {
            Status = OrderStatus.Pago;
            MarkAsUpdated();
        }
    }
}