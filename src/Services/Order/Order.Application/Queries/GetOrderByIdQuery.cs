using Common.Behaviors;
using MediatR;
using Order.Application.ViewModels;

namespace Order.Application.Queries.GetOrderById;

public record GetOrderByIdQuery(string Id) : IRequest<Result<OrderDetailViewModel>>;