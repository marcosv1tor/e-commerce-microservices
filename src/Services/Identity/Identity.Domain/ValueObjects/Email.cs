using Common.Behaviors;
using System.Text.RegularExpressions;

namespace Identity.Domain.ValueObjects;

/// <summary>
/// Value Object representando um endereço de email.
/// 
/// 🎓 O QUE É UM VALUE OBJECT?
/// É um objeto sem identidade, definido APENAS por seus valores.
/// Dois emails com o mesmo endereço são IDÊNTICOS, não importa onde foram criados.
/// 
/// DIFERENÇA: Entity vs Value Object
/// 
/// Entity (tem identidade):
/// User1(Id=1, Email="joao@email.com") ≠ User2(Id=2, Email="joao@email.com")
/// São pessoas diferentes!
/// 
/// Value Object (sem identidade):
/// Email("joao@email.com") == Email("joao@email.com")
/// São o mesmo email, não importa de onde vieram!
/// 
/// CARACTERÍSTICAS:
/// - Imutável (não pode ser alterado depois de criado)
/// - Igualdade por valor (não por referência)
/// - Sem identidade própria
/// - Auto-validado (sempre válido)
/// </summary>
public sealed class Email : IEquatable<Email>
{
    /// <summary>
    /// Regex para validação básica de email.
    /// 
    /// 🎓 O QUE FAZ ESTA REGEX?
    /// ^                  - Início da string
    /// [^@\s]+            - Um ou mais caracteres que NÃO são @ ou espaço
    /// @                  - O caractere @
    /// [^@\s]+            - Um ou mais caracteres que NÃO são @ ou espaço
    /// \.                 - Um ponto literal
    /// [^@\s]{2,}         - Dois ou mais caracteres que NÃO são @ ou espaço
    /// $                  - Fim da string
    /// 
    /// Exemplos válidos: joao@email.com, maria@empresa.com.br
    /// Exemplos inválidos: @email.com, joao@, joao.email.com
    /// </summary>
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase
    );

    /// <summary>
    /// O valor do email (somente leitura).
    /// 
    /// 🎓 POR QUE INIT?
    /// 'init' permite definir o valor APENAS durante a inicialização.
    /// Depois disso, é readonly (imutável).
    /// 
    /// Exemplo:
    /// var email = new Email { Value = "test@test.com" };  ✅ OK
    /// email.Value = "outro@email.com";  ❌ ERRO! Não pode alterar!
    /// </summary>
    public string Value { get; init; }

    /// <summary>
    /// Construtor privado - força o uso do método Create.
    /// 
    /// 🎓 POR QUE PRIVADO?
    /// Queremos garantir que TODO email criado seja VÁLIDO.
    /// Se o construtor fosse público:
    /// 
    /// var email = new Email { Value = "invalido" };  ❌ Permitiria email inválido!
    /// 
    /// Forçando o uso do Create:
    /// var result = Email.Create("invalido");  ✅ Retorna erro sem criar objeto!
    /// </summary>
    private Email(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Factory Method para criar um Email com validação.
    /// 
    /// 🎓 PATTERN: FACTORY METHOD + RESULT PATTERN
    /// 
    /// Por que não lançar Exception?
    /// ❌ try/catch é lento e deve ser para casos excepcionais
    /// ❌ Validação de input do usuário NÃO é excepcional
    /// 
    /// Por que retornar Result?
    /// ✅ Força o chamador a tratar sucesso E falha
    /// ✅ Mais performático (sem throw)
    /// ✅ Mais funcional (Railway Oriented Programming)
    /// 
    /// Uso:
    /// var result = Email.Create("joao@email.com");
    /// if (result.IsSuccess) {
    ///     Email email = result.Value;  // Email válido!
    /// } else {
    ///     string error = result.Error;  // "Invalid email format"
    /// }
    /// </summary>
    public static Result<Email> Create(string value)
    {
        // Validação: não pode ser nulo ou vazio
        if (string.IsNullOrWhiteSpace(value))
        {
            return Result<Email>.Failure("Email cannot be empty");
        }

        // Normalização: converter para lowercase
        // Por que? "Joao@Email.COM" é o mesmo que "joao@email.com"
        var normalizedValue = value.Trim().ToLowerInvariant();

        // Validação: formato de email
        if (!EmailRegex.IsMatch(normalizedValue))
        {
            return Result<Email>.Failure("Invalid email format");
        }

        // Tudo ok! Criar o objeto
        return Result<Email>.Success(new Email(normalizedValue));
    }

    /// <summary>
    /// Conversão implícita de Email para string.
    /// 
    /// 🎓 OPERATOR OVERLOADING
    /// Permite usar Email como se fosse string em alguns contextos.
    /// 
    /// Exemplo:
    /// Email email = Email.Create("joao@email.com").Value;
    /// string text = email;  // Conversão implícita! text = "joao@email.com"
    /// Console.WriteLine(email);  // Imprime: joao@email.com
    /// </summary>
    public static implicit operator string(Email email) => email.Value;

    /// <summary>
    /// Representação em string do email.
    /// </summary>
    public override string ToString() => Value;

    #region Implementação de Igualdade (Value Object Equality)

    /// <summary>
    /// Dois emails são iguais se têm o mesmo valor.
    /// 
    /// 🎓 VALUE EQUALITY
    /// Email("test@test.com") == Email("test@test.com")  // TRUE!
    /// 
    /// Mesmo sendo objetos diferentes na memória, são iguais
    /// porque Value Objects são comparados por VALOR, não por referência.
    /// </summary>
    public bool Equals(Email? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;

        // Compara os valores (case-insensitive já foi feito no Create)
        return Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);
    }

    public override bool Equals(object? obj)
    {
        return obj is Email email && Equals(email);
    }

    public override int GetHashCode()
    {
        // Use StringComparer para garantir hash consistente
        return StringComparer.OrdinalIgnoreCase.GetHashCode(Value);
    }

    public static bool operator ==(Email? left, Email? right)
    {
        return Equals(left, right);
    }

    public static bool operator !=(Email? left, Email? right)
    {
        return !Equals(left, right);
    }

    #endregion
}