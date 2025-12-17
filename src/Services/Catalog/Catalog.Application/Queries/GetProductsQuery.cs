using Common.Behaviors;
using MediatR;

namespace Catalog.Application.Queries.GetProducts;

// ViewModel simples para retornar apenas o necessário para a vitrine
public record ProductViewModel(
    string Id,
    string Name,
    string Description,
    decimal Price,
    string PictureUri,
    string Category,
    int Stock
);

// A resposta paginada
public record PagedResult<T>(
    int Page,
    int PageSize,
    long TotalCount,
    IEnumerable<T> Items
);

// A Query em si
public record GetProductsQuery(int Page = 1, int PageSize = 10) : IRequest<Result<PagedResult<ProductViewModel>>>;