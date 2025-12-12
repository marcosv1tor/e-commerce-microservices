namespace Common.DDD;

/// <summary>
/// Base para raízes de agregação.
/// O AggregateRoot é responsável por capturar Eventos de Domínio.
/// Ex: Quando um "User" é criado, podemos disparar um evento "UserCreatedEvent".
/// </summary>
public abstract class AggregateRoot<TId> : Entity<TId>
{
    // Lista de eventos que ocorreram com esta entidade (ex: EmailChanged, UserRegistered)
    private readonly List<object> _domainEvents = new();

    // Expõe os eventos como leitura para que o EF Core ou Repositório possa dispará-los depois
    public IReadOnlyCollection<object> DomainEvents => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(object domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}

// Versão facilitada para ID string
public abstract class AggregateRoot : AggregateRoot<string>
{
}