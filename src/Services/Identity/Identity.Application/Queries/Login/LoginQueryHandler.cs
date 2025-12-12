using Common.Behaviors;
using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using Identity.Domain.Interfaces;
using MediatR;
using System.ComponentModel;

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
            return Result<LoginResponse>.Failure("Credenciais inválidas"); // Não diga "Email não encontrado" por segurança

        // 2. Validar Senha (Utilizando BCrypt)
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!isPasswordValid)
        {
            return Result<LoginResponse>.Failure("Credenciais inválidas");
        }

        // 3. Gerar Token
        var token = _tokenService.GenerateToken(user);

        // 4. Gerar Refresh Token (Acesso longo, salva no banco)
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Adiciona o token na entidade User (Regra de Negócio: expira em 30 dias)
        user.AddRefreshToken(refreshToken, 30);

        // 5. Salvar a alteração no MongoDB
        await _userRepository.UpdateAsync(user);

        // 6. Retornar DTO
        var response = new LoginResponse(
            Guid.Parse(user.Id), 
            user.Name, 
            user.Email.Value, 
            token,
            refreshToken
        );

        return Result<LoginResponse>.Success(response);
    }
}