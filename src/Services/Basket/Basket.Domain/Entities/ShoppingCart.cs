namespace Basket.Domain.Entities;

public class ShoppingCart
{
    public string UserName { get; set; } = default!;
    public List<ShoppingCartItem> Items { get; set; } = new();

    public ShoppingCart()
    {
    }

    public ShoppingCart(string userName)
    {
        UserName = userName;
    }

    // Propriedade calculada para saber o total (útil para o Checkout depois)
    public decimal TotalPrice => Items.Sum(item => item.Price * item.Quantity);
}