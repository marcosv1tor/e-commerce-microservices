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

    private  List<RefreshToken> _refreshTokens = new();
    public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

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
    public static Result<User> Register(string name, Email email, string passwordHash, string role )
    {
        // Validações básicas de Domínio
        if (string.IsNullOrEmpty(role))
            role = "User";

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

    /// <summary>
    /// Adiciona um novo Refresh Token para o usuário.
    /// </summary>
    public void AddRefreshToken(string token, int daysToExpire = 30)
    {
        var expiration = DateTime.UtcNow.AddDays(daysToExpire);
        var refreshToken = new RefreshToken(token, expiration);

        _refreshTokens.Add(refreshToken);

        // Opcional: Limpar tokens antigos/revogados para a lista não crescer infinitamente
        CleanUpOldTokens();
    }

    /// <summary>
    /// Verifica se o Refresh Token é válido.
    /// </summary>
    public bool VerifyRefreshToken(string token)
    {
        var refreshToken = _refreshTokens.FirstOrDefault(x => x.Token == token);

        // O token existe? Está ativo? Não expirou?
        return refreshToken != null &&
               !refreshToken.IsRevoked &&
               refreshToken.ExpirationDate > DateTime.UtcNow;
    }

    /// <summary>
    /// Revoga um token específico (Logout).
    /// </summary>
    public void RevokeRefreshToken(string token)
    {
        var refreshToken = _refreshTokens.FirstOrDefault(x => x.Token == token);
        refreshToken?.Revoke();
    }

    private void CleanUpOldTokens()
    {
        // Remove tokens que já expiraram há mais de 5 dias
        _refreshTokens.RemoveAll(x =>
            x.ExpirationDate <= DateTime.UtcNow.AddDays(-5) ||
            x.IsRevoked);
    }
}