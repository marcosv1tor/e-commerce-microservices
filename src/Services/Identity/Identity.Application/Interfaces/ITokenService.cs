using Identity.Domain.Entities;

namespace Identity.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
}