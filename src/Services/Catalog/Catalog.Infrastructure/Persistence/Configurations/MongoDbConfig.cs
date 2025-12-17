using Catalog.Domain.Entities;
using MongoDB.Bson.Serialization;

namespace Catalog.Infrastructure.Persistence.Configurations;

public static class MongoDbConfig
{
    public static void Configure()
    {
        if (BsonClassMap.IsClassMapRegistered(typeof(Product))) return;

        BsonClassMap.RegisterClassMap<Product>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);
        });
    }
}