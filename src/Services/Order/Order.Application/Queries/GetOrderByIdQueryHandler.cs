using Common.Behaviors;
using MediatR;
using Order.Application.ViewModels;
using Order.Domain.Interfaces;

namespace Order.Application.Queries.GetOrderById;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDetailViewModel>>
{
    private readonly IOrderRepository _repository;

    public GetOrderByIdQueryHandler(IOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<OrderDetailViewModel>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _repository.GetByIdAsync(request.Id);

        if (order is null)
            return Result<OrderDetailViewModel>.Failure("Order not found");

        // Mapeamento manual (poderia ser AutoMapper)
        var viewModel = new OrderDetailViewModel(
            order.Id,
            order.OrderCode,
            order.OrderDate,
            order.TotalPrice,
            order.Status.ToString(),
            new AddressViewModel(order.Address.Street, order.Address.City, order.Address.ZipCode),
            order.OrderItems.Select(i => new OrderItemViewModel(
                i.ProductId,
                i.ProductName,
                i.PictureUrl,
                i.UnitPrice,
                i.Units
            )).ToList()
        );

        return Result<OrderDetailViewModel>.Success(viewModel);
    }
}