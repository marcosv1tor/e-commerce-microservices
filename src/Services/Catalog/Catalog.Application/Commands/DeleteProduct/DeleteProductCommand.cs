using Common.Behaviors;
using MediatR;

namespace Catalog.Application.Commands.DeleteProduct
{
    public record DeleteProductCommand(string Id) : IRequest<Result<bool>>;
}
