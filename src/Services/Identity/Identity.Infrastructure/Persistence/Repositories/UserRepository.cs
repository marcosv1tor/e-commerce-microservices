using Identity.Domain.Entities;
using Identity.Domain.Interfaces;
using Identity.Infrastructure.Persistence.Context;
using MongoDB.Driver;

namespace Identity.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IdentityContext _context;

    public UserRepository(IdentityContext context)
    {
        _context = context;
    }
    public async Task AddAsync(User user)
    {
        // Insere o documento no MongoDB
        await _context.Users.InsertOneAsync(user);
    }
    public async Task<bool> ExistsByEmailAsync(string email)
    {
        // Busca um usuário onde o campo Email.Value seja igual ao email fornecido
        // Nota: Como Email é um objeto, acessamos a propriedade Value dele
        return await _context.Users
            .Find(u => u.Email.Value == email)
            .AnyAsync();
    }
    public async Task<User?> GetByEmailAsync(string email)
    {
        // Busca o primeiro usuário que encontrar com esse email ou retorna null
        return await _context.Users
            .Find(u => u.Email.Value == email)
            .FirstOrDefaultAsync();
    }
    public async Task UpdateAsync(User user) 
    {
        // Substitui o documento inteiro pelo novo objeto atualizado
        // O filtro é: Onde o Id do banco for igual ao Id do objeto
        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);
    }
    public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
    {
        // ❌ JEITO ANTIGO (Causa erro porque u.RefreshTokens não está mapeado)
        // return await _context.Users
        //     .Find(u => u.RefreshTokens.Any(t => t.Token == refreshToken))
        //     .FirstOrDefaultAsync();

        // ✅ JEITO NOVO (Aponta para o nome "RefreshTokens" configurado no MongoDbConfig)
        var filter = Builders<User>.Filter.ElemMatch(
            "RefreshTokens", // Nome exato que definimos no SetElementName
            Builders<RefreshToken>.Filter.Eq(x => x.Token, refreshToken)
        );

        return await _context.Users.Find(filter).FirstOrDefaultAsync();
    }
}