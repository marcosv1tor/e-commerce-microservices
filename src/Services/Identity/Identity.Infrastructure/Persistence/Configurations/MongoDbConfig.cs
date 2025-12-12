using Identity.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace Identity.Infrastructure.Persistence;

public static class MongoDbConfig
{
    public static void Configure()
    {
        // Configura o mapeamento global da classe Entity (classe base)
        // Isso diz ao Mongo: "O campo Id da classe deve ser tratado como ObjectId no banco, mas String no C#"
        /* Nota: Às vezes é necessário registrar o ClassMap manualmente se o Mongo
           não detectar propriedades privadas ou construtores protegidos.
        */

        BsonClassMap.RegisterClassMap<User>(cm =>
        {
            cm.AutoMap(); // Mapeia propriedades públicas
            cm.SetIgnoreExtraElements(true); // Ignora campos extras no banco que não tem na classe
        });
    }
}