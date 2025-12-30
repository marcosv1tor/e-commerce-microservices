using Common.Behaviors; // Do BuildingBlocks
using MediatR;          // Biblioteca de mensageria interna

namespace Identity.Application.Commands.RegisterUser;

/// <summary>
/// Representa a intenção de registrar um usuário.
/// Herda de IRequest<Result<Guid>>, ou seja, espera uma resposta contendo o ID gerado.
/// 
/// 🎓 RECORD TYPE
/// Usamos 'record' porque comandos são imutáveis. Uma vez enviado,
/// os dados do pedido não mudam.
/// </summary>
public record RegisterUserCommand(
    string Name,
    string Email,
    string Password,
    string Role
) : IRequest<Result<Guid>>;