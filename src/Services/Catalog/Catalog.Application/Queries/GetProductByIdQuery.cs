


using Catalog.Application.Queries.GetProducts;
using Common.Behaviors;
using MediatR;
using System;
using System.Collections.Generic;
using System.Diagnostics.Tracing;
using System.Text;

namespace Catalog.Application.Queries
{
    // Recebe o ID na URL e retorna um único ViewModel
    public record GetProductByIdQuery(string Id) : IRequest<Result<ProductViewModel>>;
}
