using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;


namespace Identity.Infrastructure.Services.Token;

public class JwtTokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        // 1. Pegar as configurações do appsettings.json
        var secretKey = _configuration["JwtSettings:Secret"]!;
        var issuer = _configuration["JwtSettings:Issuer"];
        var audience = _configuration["JwtSettings:Audience"];

        // 2. Definir as Claims (Os dados que vão DENTRO do token)
        // 🎓 CLAIM = Uma afirmação sobre o usuário.
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),      // Subject (ID do usuário)
            new Claim(JwtRegisteredClaimNames.Email, user.Email), // Email
            new Claim(JwtRegisteredClaimNames.Name, user.Name),   // Nome
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // ID único do Token
            // Aqui poderíamos adicionar roles: new Claim(ClaimTypes.Role, "Admin")
        };

        // 3. Criar a Chave de Segurança (Baseada no nosso Segredo)
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // 4. Configurar o Token
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(2), // O token expira em 2 horas
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        // 5. Gerar a string final
        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}