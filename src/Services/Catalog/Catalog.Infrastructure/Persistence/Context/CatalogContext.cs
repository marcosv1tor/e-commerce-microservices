using Catalog.Domain.Entities;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace Catalog.Infrastructure.Persistence.Context;

public class CatalogContext
{
    private readonly IMongoDatabase _database;

    public CatalogContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDbConnection");
        var client = new MongoClient(connectionString);

        // ⚠️ Nome do banco 
        _database = client.GetDatabase("CatalogDb");
    }

    public IMongoCollection<Product> Products => _database.GetCollection<Product>("Produtos");
}