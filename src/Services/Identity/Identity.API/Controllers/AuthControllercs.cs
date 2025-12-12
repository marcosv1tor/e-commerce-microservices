using Identity.Application.Commands.RefreshToken;
using Identity.Application.Commands.RegisterUser;
using Identity.Application.Queries.Login;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    // Injeção de Dependência do MediatR
    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Endpoint para registro de novos usuários.
    /// </summary>
    /// <param name="command">Dados do novo usuário.</param>
    /// <returns>O resultado da operação (sucesso ou falha).</returns>
    [HttpPost("registrar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
    {
        // 1. Recebe o comando da requisição HTTP (JSON)
        // 2. Envia o comando para o MediatR
        var result = await _mediator.Send(command);

        // 3. Verifica o Resultado (Result Pattern)
        if (result.IsFailure)
        {
            // Retorna 400 Bad Request com a mensagem de erro
            return BadRequest(new { error = result.Error });
        }

        // 4. Retorna 200 OK com o ID do usuário criado
        return Ok(new { userId = result.Value });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginQuery query)
    {
        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
    /// <summary>
    /// Retorna os dados do usuário logado baseados no Token.
    /// Requer Autenticação (Cadeado fechado).
    /// </summary>
    [HttpGet("me")]
    [Authorize] // 🔒 A MÁGICA ACONTECE AQUI!
    public IActionResult GetMe()
    {
        // O Middleware do .NET já descriptografou o token e preencheu a propriedade User
        var userName = User.Identity?.Name;
        var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value;
        var userId = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;

        return Ok(new
        {
            Message = "Você está na área VIP!",
            Id = userId,
            User = userName,
            Email = userEmail
        });
    }
    /// <summary>
    /// Troca um Refresh Token válido por um novo JWT e um novo Refresh Token.
    /// </summary>
    [HttpPost("refresh-token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}