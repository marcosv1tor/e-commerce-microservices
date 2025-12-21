using Order.Domain.Entities;

namespace Order.Domain.Interfaces;

public interface IOrderRepository
{
    Task AddAsync(Entities.Order order);
    Task UpdateAsync(Entities.Order order); // Para mudar status
    Task<Entities.Order?> GetByIdAsync(string id);
    Task<IEnumerable<Entities.Order>> GetByUserNameAsync(string userName); // "Meus Pedidos"
}