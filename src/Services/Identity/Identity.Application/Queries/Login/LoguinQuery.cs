using Common.Behaviors;
using global::Identity.Application.DTOs;
using MediatR;

namespace Identity.Application.Queries.Login
{
    public record LoginQuery(string Email, string Password) : IRequest<Result<LoginResponse>>;
}
