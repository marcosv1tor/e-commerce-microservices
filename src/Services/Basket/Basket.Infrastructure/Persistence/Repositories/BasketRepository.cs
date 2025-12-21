using System.Text.Json;
using Basket.Domain.Entities;
using Basket.Domain.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis;

namespace Basket.Infrastructure.Persistence.Repositories;

public class BasketRepository : IBasketRepository
{
    private readonly IDistributedCache _redisCache;
    public BasketRepository(IDistributedCache redisCache)
    {
        _redisCache = redisCache;
    }

    public async Task<ShoppingCart?> GetBasketAsync(string userName)
    {
        // Busca a string JSON no Redis usando a chave (userName)
        var basketJson = await _redisCache.GetStringAsync(userName);

        if (string.IsNullOrEmpty(basketJson))
        {
            return null;
        }

        // Deserializa de volta para objeto
        return JsonSerializer.Deserialize<ShoppingCart>(basketJson);
    }

    public async Task<ShoppingCart?> UpdateBasketAsync(ShoppingCart basket)
    {
        // Serializa o objeto para JSON
        var basketJson = JsonSerializer.Serialize(basket);

        // Salva no Redis
        // UserName é a chave, basketJson é o valor
        await _redisCache.SetStringAsync(basket.UserName, basketJson);

        // Retorna o próprio objeto atualizado
        return await GetBasketAsync(basket.UserName);
    }

    public async Task DeleteBasketAsync(string userName)
    {
        ConnectionMultiplexer redis = ConnectionMultiplexer.Connect("localhost:6379");
        IDatabase db = redis.GetDatabase();
        var value = await db.StringGetAsync("Basket" + userName);
        Console.WriteLine("valor de basket no redis --> ", value);
        await _redisCache.RemoveAsync(userName);
        await db.KeyDeleteAsync("basket" + userName);
    }
}