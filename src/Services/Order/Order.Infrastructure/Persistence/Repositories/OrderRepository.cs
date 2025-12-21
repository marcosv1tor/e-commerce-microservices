using MongoDB.Driver;
using Order.Domain.Interfaces;
using Order.Infrastructure.Persistence;
using Order.Domain.Entities;

namespace Order.Infrastructure.Persistence.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly OrderContext _context;

    public OrderRepository(OrderContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Domain.Entities.Order order)
    {
        await _context.Orders.InsertOneAsync(order);
    }

    public async Task UpdateAsync(Domain.Entities.Order order)
    {
        await _context.Orders.ReplaceOneAsync(o => o.Id == order.Id, order);
    }

    public async Task<Domain.Entities.Order?> GetByIdAsync(string id)
    {
        return await _context.Orders
            .Find(o => o.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Domain.Entities.Order>> GetByUserNameAsync(string userName)
    {
        return await _context.Orders
            .Find(o => o.UserName == userName)
            .SortByDescending(o => o.OrderDate) // Mais recentes primeiro
            .ToListAsync();
    }
}