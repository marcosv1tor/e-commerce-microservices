using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using Common.Behaviors;
using MediatR;

namespace Catalog.Application.Commands.CreateProduct;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<string>>
{
    private readonly IProductRepository _repository;

    public CreateProductCommandHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<string>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. Criar a Entidade (Ela já valida as regras básicas no construtor)
        try
        {
            var product = new Product(
                request.Name,
                request.Description,
                request.Price,
                request.PictureUri,
                request.Category,
                request.Stock
            );

            // 2. Persistir
            await _repository.AddAsync(product);

            // 3. Retornar ID
            return Result<string>.Success(product.Id);
        }
        catch (Exception ex)
        {
            // Captura erros de domínio (ex: preço negativo) e retorna como falha
            return Result<string>.Failure(ex.Message);
        }
    }
}