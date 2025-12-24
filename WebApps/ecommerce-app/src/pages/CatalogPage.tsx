import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import { type Product } from '../types/Product';
import { ProductCard } from '../components/ProductCard';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import type { ProductResponse } from '../types/ProductResponse';
import { useCartUiStore } from '../store/useCartUiStore';
import type { ShoppingCart } from '../types/Basket';
import { CartSidebar } from '../components/CartSideBar';
import { ShoppingCartIcon } from '@heroicons/react/16/solid';
import { Toast } from '../components/Toast';
import { useState } from 'react';

export function CatalogPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const { open } = useCartUiStore(); // Hook para abrir carrinho
  const queryClient = useQueryClient(); // Para atualizar cache
  
  // Estado para Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Busca os produtos na API
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // Chama o Gateway: GET /api/v1/product
      const response = await api.get<ProductResponse>('/product');
      console.log('Produtos carregados:', response.data);
      return response.data;
    },
  });

  // Busca carrinho para mostrar badge de quantidade
  const { data: cart } = useQuery({
    queryKey: ['basket', user],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await api.get<ShoppingCart>(`/basket/${user}`);
        return res.data;
      } catch {
        return { userName: user, items: [] } as ShoppingCart;
      }
    },
    enabled: !!user,
  });

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Mutation para Adicionar ao Carrinho
  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      // Primeiro, busca o carrinho atual para não sobrescrever
      let currentCart: ShoppingCart = { userName: user!, items: [] };
      try {
        const res = await api.get<ShoppingCart>(`/basket/${user}`);
        currentCart = res.data;
      } catch {
        // Carrinho não existe, cria novo
      }

      // Verifica se item já existe
      const existingItem = currentCart.items.find(i => i.productId === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        currentCart.items.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          color: 'Default',
          pictureUrl: 'img-temp-placeholder.png' // Placeholder
        });
      }

      // Envia carrinho atualizado pro Redis
      return { response: await api.post('/basket', currentCart), product };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['basket'] }); // Atualiza carrinho visual
      setToast({ 
        message: `${data.product.name} adicionado ao carrinho!`, 
        type: 'success' 
      });
      // Abre o carrinho após 1 segundo
      setTimeout(() => open(), 800);
    },
    onError: (err) => {
        console.error(err);
        setToast({ 
          message: 'Erro ao adicionar ao carrinho', 
          type: 'error' 
        });
    }
  });

  const handleAddToCart = (product: Product) => {
    addToCartMutation.mutate(product);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-4"></div>
          <p className="text-white text-xl font-semibold">Carregando vitrine...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
        <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-8 max-w-md text-center backdrop-blur-sm">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar produtos</h2>
          <p className="text-gray-300">Verifique se o Backend está online</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Toast de Notificação */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <CartSidebar />
      
      {/* Header Moderno */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo e Título */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  E-Commerce
                </h1>
                <p className="text-xs text-gray-500">Microservices Architecture</p>
              </div>
            </div>

            {/* Ações do Header */}
            <div className="flex items-center gap-6">
              {/* Botão do Carrinho com Badge */}
              <button 
                onClick={open} 
                className="relative group p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ShoppingCartIcon className="h-8 w-8 text-gray-700 group-hover:text-blue-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Informações do Usuário */}
              <div className="flex items-center gap-4 border-l border-gray-300 pl-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Bem-vindo,</p>
                  <p className="font-bold text-gray-900">{user}</p>
                </div>
                <button 
                    onClick={() => navigate('/orders')} 
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                    >
                    Meus Pedidos
                    </button>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid de Produtos */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Produtos Disponíveis
          </h2>
          <p className="text-gray-600">
            Explore nosso catálogo e adicione produtos ao carrinho
          </p>
        </div>

        {products?.items?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500">
              Cadastre alguns produtos via Swagger para começar!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {products?.items?.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}