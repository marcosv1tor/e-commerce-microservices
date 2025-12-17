using Catalog.Domain.Entities;
using Catalog.Domain.Interfaces;
using Catalog.Infrastructure.Persistence.Context;
using MongoDB.Driver;

namespace Catalog.Infrastructure.Persistence.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly CatalogContext _context;

    public ProductRepository(CatalogContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Product product)
    {
        await _context.Products.InsertOneAsync(product);
    }

    public async Task<Product?> GetByIdAsync(string id)
    {
        return await _context.Products
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<(IEnumerable<Product> Items, long TotalCount)> GetAllAsync(int page, int pageSize)
    {
        // 1. Buscar o total de registros (para calcular quantas páginas existem)
        var totalCount = await _context.Products.CountDocumentsAsync(_ => true);

        // 2. Buscar os itens da página atual
        var items = await _context.Products
            .Find(_ => true) // Filtro vazio = Trazer tudo
            .Skip((page - 1) * pageSize) // Pulo os anteriores
            .Limit(pageSize) // Pego só o tamanho da página
            .ToListAsync();

        return (items, totalCount);
    }

    // ... dentro da classe ProductRepository ...

    public async Task UpdateAsync(Product product)
    {
        // ReplaceOneAsync: Substitui o documento inteiro pelo novo objeto 'product'
        // Filtro: Onde o Id do banco for igual ao Id do objeto
        await _context.Products.ReplaceOneAsync(p => p.Id == product.Id, product);
    }

    public async Task DeleteAsync(string id)
    {
        // DeleteOneAsync: Remove o documento que tiver este ID
        await _context.Products.DeleteOneAsync(p => p.Id == id);
    }
}