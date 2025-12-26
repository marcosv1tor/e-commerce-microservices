using Common.Behaviors;
using MediatR;
using Order.Application.ViewModels;
using Order.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Order.Application.Queries
{
    public class DeleteOrderByIdAsyncQueryHandler : IRequestHandler<DeleteOrderByIdAsyncQuery, Result<bool>>
    {

        private readonly IOrderRepository _repository;

        public DeleteOrderByIdAsyncQueryHandler(IOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteOrderByIdAsyncQuery request, CancellationToken cancellationToken)
        {
            var order = await _repository.DeleteAsync(request.Id);
            if (order is false)
                return Result<bool>.Failure("Pedido não encontrado");

            return Result<bool>.Success(order);

        }
    }
}
