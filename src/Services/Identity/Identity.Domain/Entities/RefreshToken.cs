using Common.DDD; 

namespace Identity.Domain.Entities;

public class RefreshToken : Entity<string>
{
    public string Token { get; private set; }
    public DateTime ExpirationDate { get; private set; }
    public bool IsRevoked { get; private set; }

    // Construtor vazio para o Mongo
    protected RefreshToken() { }

    public RefreshToken(string token, DateTime expirationDate)
    {
        Id = Guid.NewGuid().ToString();
        Token = token;
        ExpirationDate = expirationDate;
        IsRevoked = false;
    }

    public void Revoke()
    {
        IsRevoked = true;
        MarkAsUpdated();
    }
}