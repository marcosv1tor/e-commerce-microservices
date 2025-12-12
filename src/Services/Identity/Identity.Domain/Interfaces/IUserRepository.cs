using Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Identity.Domain.Interfaces
/// <summary>
/// Contrato que define como acessar os dados do Usuário.
/// 
/// 🎓 POR QUE INTERFACE?
/// A camada Domain NÃO deve conhecer o MongoDB. Ela apenas diz:
/// "Eu preciso salvar um usuário". Quem vai decidir se é no Mongo, SQL ou Arquivo
/// é a camada de Infrastructure, que implementará esta interface.
/// </summary>
{
    public interface IUserRepository
    {
        // Verifica se o email já existe (Regra de negócio: email único)
        Task<bool> ExistsByEmailAsync(string email);

        Task<User?> GetByEmailAsync(string email);

        // Adiciona o usuário
        Task AddAsync(User user);
    }
}
