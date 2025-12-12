using Identity.Domain.Entities;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace Identity.Infrastructure.Persistence.Context;

public class IdentityContext
{
    private readonly IMongoDatabase _database;

    public IdentityContext(IConfiguration configuration)
    {
        // Lê a connection string do arquivo appsettings.json
        var connectionString = configuration.GetConnectionString("MongoDbConnection");
        var client = new MongoClient(connectionString);

        // Nome do banco de dados
        _database = client.GetDatabase("IdentityDb");
    }

    // Mapeia a coleção "Users" para a entidade User
    public IMongoCollection<User> Users => _database.GetCollection<User>("Clientes");
}