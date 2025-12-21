namespace Order.Domain.ValueObjects;

// Implementar uma classe base ValueObject no Common, como ainda não temos, vamos fazer um record simples (temporáriamente)
public record Address(
    string Street,
    string City,
    string State,
    string Country,
    string ZipCode
);