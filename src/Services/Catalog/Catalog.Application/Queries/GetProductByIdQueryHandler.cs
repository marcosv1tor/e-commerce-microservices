using Catalog.Application.Queries.GetProducts;
using Catalog.Domain.Interfaces;
using Common.Behaviors;
using MediatR;

namespace Catalog.Application.Queries;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, Result<ProductViewModel>>
{
    private readonly IProductRepository _repository;

    public GetProductByIdQueryHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ProductViewModel>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        // 1. Busca no banco
        var product = await _repository.GetByIdAsync(request.Id);

        // 2. Valida se encontrou
        if (product is null)
        {
            return Result<ProductViewModel>.Failure("Produto não encontrado");
        }

        // 3. Mapeia para ViewModel
        var viewModel = new ProductViewModel(
            product.Id,
            product.Name,
            product.Description,
            product.Price,
            product.PictureUri,
            product.Category,
            product.AvailableStock
        );

        return Result<ProductViewModel>.Success(viewModel);
    }
}