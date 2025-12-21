namespace Order.Application.DTOs;

public record OrderItemDto(
    string ProductId,
    string ProductName,
    string PictureUrl,
    decimal UnitPrice,
    int Units
);