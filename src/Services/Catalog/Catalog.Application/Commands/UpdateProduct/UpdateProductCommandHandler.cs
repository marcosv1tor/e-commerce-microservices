using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using Common.Behaviors;
using MediatR;

namespace Catalog.Application.Commands.UpdateProduct;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result<bool>>
{
    private readonly IProductRepository _repository;

    public UpdateProductCommandHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(UpdateProductCommand request, CancellationToken cancellation)
    {
        var product = await _repository.GetByIdAsync(request.Id);

        // 1. Recuperar o objeto do banco de dados
        // Precisamos do objeto "vivo" para chamar métodos nele.
        if (product == null)
        {
            return Result<bool>.Failure("Produto não encontrado");
        }
        // 3. Executar Lógica de Domínio
        // ⚠️ IMPORTANTE: Não fazemos "product.Price = request.Price".
        // Chamamos o método que criamos lá na Entidade Product.cs.
        // É ele que valida se o preço não é negativo, se o nome não está vazio, etc.
        try
        {
            product.UpdateDetails(
                request.Name,
                request.Description,
                request.Price,
                request.PictureUri,
                request.Category
                );
        }
        catch (Exception ex)
        {
            // Se a regra de negócio falhar (ex: Preço negativo), retornamos o erro
            return Result<bool>.Failure(ex.Message);
        }
        // 4. Persistir a alteração
        // O objeto 'product' agora tem os dados novos na memória. Mandamos o Repo salvar no Mongo.
        await _repository.UpdateAsync(product);
        return Result<bool>.Success(true);
    }    
}
