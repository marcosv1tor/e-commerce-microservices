using Common.Behaviors;
using MediatR;
using Order.Application.ViewModels;

namespace Order.Application.Queries.GetOrders;

public record GetOrdersByUserNameQuery(string UserName) : IRequest<Result<IEnumerable<OrderViewModel>>>;