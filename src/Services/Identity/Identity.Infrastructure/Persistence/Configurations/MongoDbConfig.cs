using Identity.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace Identity.Infrastructure.Persistence;

public static class MongoDbConfig
{
    public static void Configure()
    {
        // Se já estiver registrado, não faz nada (evita erro de registro duplicado)
        if (BsonClassMap.IsClassMapRegistered(typeof(User)))
            return;

        BsonClassMap.RegisterClassMap<User>(cm =>
        {
            cm.AutoMap(); // Mapeia as propriedades públicas (Name, Email, etc)
            cm.SetIgnoreExtraElements(true);

            // 👇 A MÁGICA É AQUI:
            // Dizemos explicitamente: "O campo C# '_refreshTokens' = Coluna Banco 'RefreshTokens'"
            cm.MapField("_refreshTokens").SetElementName("RefreshTokens");
        });
    }
}