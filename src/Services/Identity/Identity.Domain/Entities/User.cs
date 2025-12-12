using Common.DDD;
using Common.Behaviors; // Referência ao BuildingBlocks
using Identity.Domain.ValueObjects; // Referência ao seu ValueObject de Email

namespace Identity.Domain.Entities;

// User herda de AggregateRoot, pois ele é a entidade principal deste contexto
public class User : AggregateRoot
{
    public string Name { get; private set; }
    public Email Email { get; private set; } // Uso do Value Object
    public string PasswordHash { get; private set; }
    public string Role { get; private set; }
    public bool IsActive { get; private set; }

    // Construtor vazio para o EF Core/MongoDB conseguir materializar o objeto
    protected User() { }

    // Construtor privado para forçar o uso do Factory Method
    private User(string name, Email email, string passwordHash, string role)
    {
        Id = Guid.NewGuid().ToString(); // Gera ID novo
        Name = name;
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        IsActive = true;

        // Aqui poderíamos adicionar um evento: AddDomainEvent(new UserRegisteredEvent(Id, Email));
    }

    // 🎓 FACTORY METHOD
    // Cria um usuário garantindo que ele nasça válido
    public static Result<User> Register(string name, Email email, string passwordHash, string role = "User")
    {
        // Validações básicas de Domínio
        if (string.IsNullOrWhiteSpace(name))
            return Result<User>.Failure("Nome não pode ser vazio");

        if (string.IsNullOrWhiteSpace(passwordHash))
            return Result<User>.Failure("A senha é obrigatória");

        // Retorna o usuário criado
        return Result<User>.Success(new User(name, email, passwordHash, role));
    }

    // 🎓 COMPORTAMENTO
    // Métodos para alterar o estado. Nunca usamos "Setters" públicos.
    public void UpdateName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ArgumentException("Nome não pode ser vazio");

        Name = newName;
        MarkAsUpdated(); // Método da classe base Entity
    }

    public void UpdateEmail(Email email)
    {
        if (string.IsNullOrWhiteSpace(email) || email == null) throw new ArgumentException("Email não pode ser vazio");
        Email = email;
        MarkAsUpdated();
    }

    public void Deactivate()
    {
        if (!IsActive) return;
        IsActive = false;
        MarkAsUpdated();
    }
}