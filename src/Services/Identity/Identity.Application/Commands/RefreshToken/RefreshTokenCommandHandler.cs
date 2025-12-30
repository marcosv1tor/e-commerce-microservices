using Common.Behaviors;
using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using Identity.Domain.Interfaces;
using MediatR;

namespace Identity.Application.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<LoginResponse>>
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<Result<LoginResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        // 1. Encontrar o dono do token
        var user = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken);

        // Se não achar o usuário ou o token não pertencer a ninguém válido
        if (user is null)
            return Result<LoginResponse>.Failure("Token inválido");

        // 2. Validar o Token usando o método de Domínio que criamos antes
        // (Verifica se expirou ou se já foi revogado)
        if (!user.VerifyRefreshToken(request.RefreshToken))
            return Result<LoginResponse>.Failure("Token inválido ou expirado");

        // 3. ROTAÇÃO DE TOKEN (Segurança)
        // Primeiro, revogamos o token antigo (que acabou de ser usado)
        user.RevokeRefreshToken(request.RefreshToken);

        // Segundo, geramos os novos tokens
        var newJwtToken = _tokenService.GenerateToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        // Terceiro, adicionamos o novo refresh token na lista do usuário
        user.AddRefreshToken(newRefreshToken);

        // 4. Salvar as alterações no MongoDB
        // O user agora tem o token velho marcado como revogado e o novo ativo
        await _userRepository.UpdateAsync(user);

        // 5. Retornar os novos dados
        var response = new LoginResponse(
            Guid.Parse(user.Id),
            user.Name,
            user.Email.Value,
            newJwtToken,
            newRefreshToken,
            user.Role
        );

        return Result<LoginResponse>.Success(response);
    }
}