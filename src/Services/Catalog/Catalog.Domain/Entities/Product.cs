using Common.DDD; // Referência ao BuildingBlocks

namespace Catalog.Domain.Entities;

public class Product : AggregateRoot
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public decimal Price { get; private set; }
    public string PictureUri { get; private set; }
    public int AvailableStock { get; private set; }

    // Categoria Simples (apenas string por enquanto para facilitar, ou ID)
    // Em sistemas complexos, seria uma entidade separada. Vamos usar referência simples aqui.
    public string Category { get; private set; }

    protected Product() { }

    public Product(string name, string description, decimal price, string pictureUri, string category, int stock)
    {
        Id = Guid.NewGuid().ToString();
        Name = name;
        Description = description;
        Price = price;
        PictureUri = pictureUri;
        Category = category;
        AvailableStock = stock;

        Validate();
    }

    // Validação básica de domínio
    private void Validate()
    {
        if (string.IsNullOrWhiteSpace(Name)) throw new ArgumentNullException(nameof(Name));
        if (Price < 0) throw new ArgumentException("Preço não pode ser negativo");
        if (AvailableStock < 0) throw new ArgumentException("Estoque não pode ser negativo");
    }

    // 🎓 MÉTODOS DE NEGÓCIO (Comportamento)

    public void UpdateDetails(string name, string description, decimal price, string pictureUri, string category)
    {
        Name = name;
        Description = description;
        Price = price; // Aqui poderíamos disparar um evento "ProductPriceChanged"
        PictureUri = pictureUri;
        Category = category;

        Validate();
        MarkAsUpdated();
    }

    public void AddStock(int quantity)
    {
        AvailableStock += quantity;
        MarkAsUpdated();
    }

    public void RemoveStock(int quantity)
    {
        if (AvailableStock < quantity)
        {
            // Em DDD, usamos Exceptions de Domínio para regras quebradas
            throw new DomainException($"Estoque insuficiente. Solicitado: {quantity}, Disponível: {AvailableStock}");
        }

        AvailableStock -= quantity;
        MarkAsUpdated();
    }
}

// Pequena classe auxiliar para exceções de domínio
public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}