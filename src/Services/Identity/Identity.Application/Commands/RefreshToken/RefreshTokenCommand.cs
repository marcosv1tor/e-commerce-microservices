using Common.Behaviors;
using Identity.Application.DTOs;
using MediatR;

namespace Identity.Application.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<Result<LoginResponse>>;