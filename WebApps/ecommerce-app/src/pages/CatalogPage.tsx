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
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon, ArrowRightOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
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
  const totalPrice = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

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
      <header className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo, Título e Menu Minha Conta */}
            <div className="flex items-center gap-4">
              {/* Logo e Título */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    E-Commerce
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Microservices Architecture</p>
                </div>
              </div>

              {/* Separador Visual */}
              <div className="h-12 w-px bg-gray-200 hidden sm:block" />

              
              
              {/* Menu Minha Conta com Dropdown */}

              <div className="flex items-center gap-4 pl-6 ml-auto pr-6">
                <div className="text-center pr-6">
                  <p className="text-s text-gray-500">Bem-vindo,</p>
                  <p className="font-bold text-gray-900">{user}</p>
                </div>
              </div>
            </div>
          
            {/* Ações do Header - Lado Direito */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Botão do Carrinho */}
              <button 
                onClick={open} 
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200"
                aria-label="Carrinho de compras"
              >
                <div className="relative">
                  <ShoppingCartIcon className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                      {totalItems}
                    </span>
                  )}
                </div>
                {totalItems > 0 && (
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-xs text-gray-500">Carrinho</span>
                    <span className="text-sm font-semibold text-gray-900">
                      R$ {totalPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </button>
              <Menu as="div" className="relative">
                {({ open }) => (
                  <>
                    <Menu.Button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 group">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                          <UserCircleIcon className="h-5 w-5" />
                        </div>
                        <span className="hidden sm:inline">Minha conta</span>
                        <ChevronDownIcon 
                          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
                        />
                      </div>
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="px-1 py-1">
                          {/* Informações do Usuário no Topo */}
                          <div className="px-3 py-2 border-b border-gray-100">
                            <p className="text-xs text-gray-500">Bem-vindo</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{user}</p>
                          </div>

                          {/* Opções do Menu */}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                } group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors`}
                                onClick={() => navigate('/orders')}
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Meus Pedidos
                              </button>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                } group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors`}
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Perfil
                              </button>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                } group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors`}
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Configurações
                              </button>
                            )}
                          </Menu.Item>
                        </div>

                        {/* Botão Sair (último item) */}
                        <div className="px-1 py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={`${
                                  active ? 'bg-red-50 text-red-600' : 'text-red-600'
                                } group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors`}
                              >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                Sair
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </>
                )}
              </Menu>
              
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