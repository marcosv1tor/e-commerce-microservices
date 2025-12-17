using Common.Behaviors; // BuildingBlocks
using MediatR;

namespace Catalog.Application.Commands.CreateProduct;

// Define os dados que vêm do Front-end/API
public record CreateProductCommand(
    string Name,
    string Description,
    decimal Price,
    string PictureUri,
    string Category,
    int Stock
) : IRequest<Result<string>>; // Retorna o ID (string)