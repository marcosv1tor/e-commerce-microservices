using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DDD;

/// <summary>
/// Classe base abstrata para todas as entidades do domínio.
/// 
/// 🎓 O QUE É UMA ENTIDADE?
/// Uma entidade é um objeto que possui IDENTIDADE ÚNICA (ID).
/// Duas entidades são diferentes se seus IDs são diferentes,
/// mesmo que tenham os mesmos valores em outros campos.
/// 
/// Exemplo:
/// User1 (Id=1, Nome="João") ≠ User2 (Id=2, Nome="João")
/// São pessoas diferentes, mesmo tendo o mesmo nome!
/// </summary>
/// <typeparam name="TId">Tipo do identificador (string, Guid, int, etc)</typeparam>
public abstract class Entity<TId> : IEquatable<Entity<TId>>
{
    /// <summary>
    /// Identificador único da entidade.
    /// 
    /// 🎓 POR QUE PROTECTED SET?
    /// - GET público: Qualquer um pode ler o ID
    /// - SET protegido: Apenas a própria classe e classes filhas podem alterar
    /// 
    /// Isso garante que o ID não seja mudado acidentalmente de fora!
    /// </summary>
    public TId Id { get; protected set; } = default!;

    /// <summary>
    /// Data de criação da entidade.
    /// Útil para auditoria e ordenação.
    /// </summary>
    public DateTime CreatedAt { get; protected set; }

    /// <summary>
    /// Data da última atualização.
    /// Automaticamente atualizada quando a entidade é modificada.
    /// </summary>
    public DateTime? UpdatedAt { get; protected set; }

    /// <summary>
    /// Construtor protegido - só pode ser chamado por classes filhas.
    /// 
    /// 🎓 POR QUE PROTECTED?
    /// Queremos que apenas User, Product, etc possam criar instâncias.
    /// Não faz sentido criar um "Entity" genérico diretamente.
    /// </summary>
    protected Entity()
    {
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Construtor com ID (para reconstruir entidade do banco).
    /// 
    /// 🎓 QUANDO USAR?
    /// Quando você busca uma entidade do MongoDB, ela já tem um ID.
    /// Este construtor permite reconstruir o objeto com o ID existente.
    /// </summary>
    protected Entity(TId id) : this()
    {
        Id = id;
    }

    /// <summary>
    /// Marca a entidade como atualizada, registrando o timestamp.
    /// 
    /// 🎓 POR QUE PROTECTED?
    /// Queremos que apenas métodos internos da entidade chamem isso.
    /// Ex: Quando User.ChangePassword() é chamado, ele chama MarkAsUpdated()
    /// </summary>
    protected void MarkAsUpdated()
    {
        UpdatedAt = DateTime.UtcNow;
    }

    #region Implementação de Igualdade

    /// <summary>
    /// Duas entidades são iguais se têm o mesmo ID.
    /// 
    /// 🎓 VALUE EQUALITY vs REFERENCE EQUALITY
    /// 
    /// Sem override:
    /// var user1 = new User { Id = "123" };
    /// var user2 = new User { Id = "123" };
    /// user1 == user2  // FALSE! (objetos diferentes na memória)
    /// 
    /// Com override:
    /// user1 == user2  // TRUE! (mesmo ID = mesma entidade)
    /// </summary>
    public bool Equals(Entity<TId>? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;

        // Duas entidades são iguais se têm o mesmo tipo E o mesmo ID
        return GetType() == other.GetType() &&
               EqualityComparer<TId>.Default.Equals(Id, other.Id);
    }

    /// <summary>
    /// Override do Equals padrão do C#.
    /// Necessário para funcionar com coleções (List, Dictionary, etc).
    /// </summary>
    public override bool Equals(object? obj)
    {
        return obj is Entity<TId> entity && Equals(entity);
    }

    /// <summary>
    /// GetHashCode deve ser consistente com Equals.
    /// 
    /// 🎓 POR QUE?
    /// Se dois objetos são "iguais" (Equals = true), 
    /// eles DEVEM ter o mesmo HashCode.
    /// Isso é fundamental para Dictionary, HashSet, etc.
    /// </summary>
    public override int GetHashCode()
    {
        return HashCode.Combine(GetType(), Id);
    }

    /// <summary>
    /// Operador == usando nossa lógica de igualdade.
    /// </summary>
    public static bool operator ==(Entity<TId>? left, Entity<TId>? right)
    {
        return Equals(left, right);
    }

    /// <summary>
    /// Operador != (negação do ==).
    /// </summary>
    public static bool operator !=(Entity<TId>? left, Entity<TId>? right)
    {
        return !Equals(left, right);
    }

    #endregion
}

/// <summary>
/// Classe base para entidades com ID do tipo string (padrão MongoDB).
/// 
/// 🎓 POR QUE STRING?
/// MongoDB usa ObjectId que é convertido para string no .NET.
/// Esta é uma classe de conveniência para não precisar escrever Entity<string> toda vez.
/// 
/// Exemplo de uso:
/// public class User : Entity  // Em vez de Entity<string>
/// {
///     public string Name { get; private set; }
/// }
/// </summary>
public abstract class Entity : Entity<string>
{
    protected Entity() : base() { }
    protected Entity(string id) : base(id) { }
}