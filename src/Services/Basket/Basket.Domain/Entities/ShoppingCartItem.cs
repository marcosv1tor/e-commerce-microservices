namespace Basket.Domain.Entities;

public class ShoppingCartItem
{
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public string ProductId { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public string PictureUrl { get; set; } = default!;
    public string? Categorie { get; set; }
}