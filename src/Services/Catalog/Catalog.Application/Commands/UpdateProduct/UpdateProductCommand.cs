using Common.Behaviors;
using MediatR;

namespace Catalog.Application.Commands.UpdateProduct;
public record UpdateProductCommand(
    string Id,
    string Name,
    string Description,
    decimal Price,
    string PictureUri,
    string Category
) : IRequest<Result<bool>>; // Retorna True se sucesso