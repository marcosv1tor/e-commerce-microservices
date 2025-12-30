using Common.Behaviors;
using MediatR;
using Order.Application.ViewModels;
using Order.Domain.Interfaces;

namespace Order.Application.Queries.GetOrders;

public class GetOrdersByUserNameQueryHandler : IRequestHandler<GetOrdersByUserNameQuery, Result<IEnumerable<OrderViewModel>>>
{
    private readonly IOrderRepository _repository;

    public GetOrdersByUserNameQueryHandler(IOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IEnumerable<OrderViewModel>>> Handle(GetOrdersByUserNameQuery request, CancellationToken cancellationToken)
    {
        var orders = await _repository.GetByUserNameAsync(request.UserName);

        var viewModels = orders.Select(o => new OrderViewModel(
            o.Id,
            o.OrderCode,
            o.OrderDate,
            o.TotalPrice,
            o.Status.ToString(), // Converte Enum para texto (ex: "Paid")
            o.OrderItems.Sum(i => i.Units)
        ));

        return Result<IEnumerable<OrderViewModel>>.Success(viewModels);
    }
}