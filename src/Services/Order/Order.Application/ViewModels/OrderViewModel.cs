using Order.Domain.Entities; // Para acessar o Enum Status

namespace Order.Application.ViewModels;

public record OrderViewModel(
    string Id,
    DateTime OrderDate,
    decimal TotalPrice,
    string Status, // Vamos converter o Enum para string na tela
    int TotalItems
);

public record OrderDetailViewModel(
    string Id,
    DateTime OrderDate,
    decimal TotalPrice,
    string Status,
    AddressViewModel ShippingAddress,
    List<OrderItemViewModel> OrderItems
);

public record AddressViewModel(string Street, string City, string ZipCode);

public record OrderItemViewModel(
    string ProductId,
    string ProductName,
    string PictureUrl,
    decimal UnitPrice,
    int Units
);