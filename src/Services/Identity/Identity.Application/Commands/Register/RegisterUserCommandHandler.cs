using Common.Behaviors;
using Identity.Domain.Entities;
using Identity.Domain.Interfaces;
using Identity.Domain.ValueObjects;
using MediatR;

namespace Identity.Application.Commands.RegisterUser;

/// <summary>
/// O cérebro da operação. Recebe o comando e executa a lógica.
/// </summary>
public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Result<Guid>>
{
    private readonly IUserRepository _userRepository;

    // Injeção de Dependência: O Handler pede um repositório, não importa qual banco seja.
    public RegisterUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<Guid>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Criar o Value Object de Email (já valida formato)
        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure)
            return Result<Guid>.Failure(emailResult.Error);

        // 2. Verificar se já existe no banco (Regra de negócio de unicidade)
        var emailExists = await _userRepository.ExistsByEmailAsync(emailResult.Value.Value);
        if (emailExists)
            return Result<Guid>.Failure("Email já está em uso.");

        // 3. Hash da senha (SIMULAÇÃO POR ENQUANTO)
        // Nota: Em produção, usaríamos um serviço de hash real aqui.
        var passwordHash = request.Password + "_hashed";

        // 4. Usar a Factory do Domain para criar a Entidade
        var userResult = User.Register(
            request.Name,
            emailResult.Value,
            passwordHash
        );

        if (userResult.IsFailure)
            return Result<Guid>.Failure(userResult.Error);

        var user = userResult.Value;

        // 5. Persistir usando o repositório
        await _userRepository.AddAsync(user);

        // 6. Retornar Sucesso com o ID (Convertendo string para Guid se necessário, ou mudando o retorno)
        // Como definimos User.Id como string (MongoDB), vamos adaptar o retorno ou parsear.
        // Se o ID for GUID string, ok.
        return Result<Guid>.Success(Guid.Parse(user.Id));
    }
}