using Catalog.Domain.Interfaces;
using Common.Behaviors;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Catalog.Application.Commands.DeleteProduct
{
    public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result<bool>>
    {
        private readonly IProductRepository _repository;

        public DeleteProductCommandHandler(IProductRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // 1. Verifica se existe antes de tentar deletar
                var product = await _repository.GetByIdAsync(request.Id);
                if (product is null)
                {
                    return Result<bool>.Failure("Produto não encontrado");
                }

                // 2. Manda deletar
                await _repository.DeleteAsync(request.Id);

                return Result<bool>.Success(true);
            }
            catch (Exception)
            {

                throw;
            }
        }
    }
}
