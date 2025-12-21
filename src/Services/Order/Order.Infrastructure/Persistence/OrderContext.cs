using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace Order.Infrastructure.Persistence;

public class OrderContext
{
    private readonly IMongoDatabase _database;

    public OrderContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDbConnection");
        var client = new MongoClient(connectionString);
        _database = client.GetDatabase("OrderDb"); // Banco separado!
    }

    public IMongoCollection<Domain.Entities.Order> Orders =>
        _database.GetCollection<Domain.Entities.Order>("Pedidos");
}