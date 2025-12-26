using Common.Behaviors;
using MediatR;
using Order.Application.ViewModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Order.Application.Queries
{
    public record DeleteOrderByIdAsyncQuery(string Id) : IRequest<Result<bool>>;
}
