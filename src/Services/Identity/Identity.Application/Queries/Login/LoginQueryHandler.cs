using Common.Behaviors;
using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using Identity.Domain.Interfaces;
using MediatR;

namespace Identity.Application.Queries.Login;

public class LoginQueryHandler : IRequestHandler<LoginQuery, Result<LoginResponse>>
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public LoginQueryHandler(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<Result<LoginResponse>> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        // 1. Buscar usuário no banco
        var user = await _userRepository.GetByEmailAsync(request.Email);
        
        if (user is null)
            return Result<LoginResponse>.Failure("Invalid credentials"); // Não diga "Email não encontrado" por segurança

        // 2. Validar Senha (SIMULAÇÃO: Comparando texto puro por enquanto)
        // Em breve usaremos BCrypt aqui!
        var passwordHashInput = request.Password + "_hashed"; 
        if (user.PasswordHash != passwordHashInput)
        {
            return Result<LoginResponse>.Failure("Invalid credentials");
        }

        // 3. Gerar Token
        var token = _tokenService.GenerateToken(user);

        // 4. Retornar DTO
        var response = new LoginResponse(
            Guid.Parse(user.Id), 
            user.Name, 
            user.Email.Value, 
            token
        );

        return Result<LoginResponse>.Success(response);
    }
}