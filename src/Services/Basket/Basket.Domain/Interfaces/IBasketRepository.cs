using Basket.Domain.Entities;

namespace Basket.Domain.Interfaces;

public interface IBasketRepository
{
    // Busca o carrinho pelo nome do usuário
    Task<ShoppingCart?> GetBasketAsync(string userName);

    // Salva ou Atualiza o carrinho (no Redis é a mesma operação: Set)
    Task<ShoppingCart?> UpdateBasketAsync(ShoppingCart basket);

    // Apaga o carrinho (ex: depois de finalizar a compra)
    Task DeleteBasketAsync(string userName);
}