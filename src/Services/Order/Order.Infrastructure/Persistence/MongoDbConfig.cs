using MongoDB.Bson.Serialization;
using Order.Domain.Entities;
using Order.Domain.ValueObjects;

namespace Order.Infrastructure.Persistence;

public static class MongoDbConfig
{
    public static void Configure()
    {
        // Se já configurou, sai
        if (BsonClassMap.IsClassMapRegistered(typeof(Domain.Entities.Order))) return;

        // 1. Mapeamento do Pedido (Root)
        BsonClassMap.RegisterClassMap<Domain.Entities.Order>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);

            // Mapeia o campo privado _orderItems para a coluna OrderItems
            cm.MapField("_orderItems").SetElementName("OrderItems");
        });

        // 2. Mapeamento do Item (Child)
        BsonClassMap.RegisterClassMap<OrderItem>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);
        });

        // 3. Mapeamento do Endereço (Value Object)
        // Como é um record/classe sem ID, o AutoMap geralmente resolve, 
        // mas registrar garante que ele entenda como serializar.
        BsonClassMap.RegisterClassMap<Address>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);
        });
    }
}