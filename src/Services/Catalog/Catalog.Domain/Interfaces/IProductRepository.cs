using Catalog.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Catalog.Domain.Interfaces
{
    public interface IProductRepository
    {
        Task AddAsync(Product product);
        Task<Product?> GetByIdAsync(string id);
        Task<(IEnumerable<Product> Items, long TotalCount)> GetAllAsync(int page, int pageSize);
        Task UpdateAsync(Product product);
        Task DeleteAsync(string id);
    }
}
