using Common.DDD;

namespace Order.Domain.Entities;

public class OrderItem : Entity<string>
{
    public string ProductId { get; private set; }
    public string ProductName { get; private set; }
    public string PictureUrl { get; private set; }
    public decimal UnitPrice { get; private set; }
    public int Units { get; private set; }

    // Construtor vazio para EF Core/Mongo
    protected OrderItem() { }

    public OrderItem(string productId, string productName, string pictureUrl, decimal unitPrice, int units)
    {
        Id = Guid.NewGuid().ToString();
        ProductId = productId;
        ProductName = productName;
        PictureUrl = pictureUrl;
        UnitPrice = unitPrice;
        Units = units;
    }

    public void AddUnits(int units)
    {
        if (units < 0) throw new Exception("Invalid units");
        Units += units;
    }
}