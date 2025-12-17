using Catalog.Domain.Interfaces;
using Common.Behaviors;
using MediatR;

namespace Catalog.Application.Queries.GetProducts;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, Result<PagedResult<ProductViewModel>>>
{
    private readonly IProductRepository _repository;

    public GetProductsQueryHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResult<ProductViewModel>>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        // 1. Busca no repositório
        var (products, totalCount) = await _repository.GetAllAsync(request.Page, request.PageSize);

        // 2. Mapeia para ViewModel (Poderíamos usar AutoMapper aqui futuramente)
        var viewModels = products.Select(p => new ProductViewModel(
            p.Id,
            p.Name,
            p.Description,
            p.Price,
            p.PictureUri,
            p.Category,
            p.AvailableStock
        ));

        // 3. Monta o resultado paginado
        var result = new PagedResult<ProductViewModel>(
            request.Page,
            request.PageSize,
            totalCount,
            viewModels
        );

        return Result<PagedResult<ProductViewModel>>.Success(result);
    }
}