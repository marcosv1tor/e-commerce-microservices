import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCartUiStore } from '../store/useCartUiStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import { type ShoppingCart } from '../types/Basket';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function CartSidebar() {
  // 1. Pega o estado e a função de fechar do Zustand
  const { isOpen, close } = useCartUiStore();
  
  // LOG PARA DEBUG: Abra o F12 e veja se isso muda para 'true' ao clicar
  console.log("🛒 ESTADO DO CARRINHO:", isOpen);
  const navigate = useNavigate();   
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // Busca Carrinho
  const { data: cart } = useQuery({
    queryKey: ['basket', user],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await api.get<ShoppingCart>(`/basket/${user}`);
        return res.data;
      } catch (err) {
        return { userName: user, items: [] } as ShoppingCart;
      }
    },
    enabled: !!user && isOpen, 
  });

  // Remover Item
  const updateBasketMutation = useMutation({
    mutationFn: async (newCart: ShoppingCart) => {
      return await api.post('/basket', newCart);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basket'] });
    },
  });

  const removeItem = (productId: string) => {
    if (!cart) return;
    const updatedItems = cart.items.filter((item) => item.productId !== productId);
    updateBasketMutation.mutate({ ...cart, items: updatedItems });
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

//   const handleCheckout = async () => {
//   if (!cart || cart.items.length === 0) return;

//   // Checkout payload
//   const payload = {
//     address: {
//       street: "Rua Developer, 10",
//       city: "São Paulo",
//       state: "SP",
//       country: "Brasil",
//       zipCode: "12345-000",
//     },
//     items: cart.items.map(item => ({
//       productId: item.productId,
//       productName: item.productName,
//       unitPrice: item.price,
//       units: item.quantity,
//       pictureUrl: item.pictureUrl || "",
//     })),
//   };

//   try {
//     await api.post("/order/checkout", payload);
//     alert("✅ Pedido Realizado com Sucesso!");
//     close();
//     queryClient.setQueryData(["order", user], { userName: user, items: [] });
//     removeItem(cart.items.map(i => i.productId).join(","));
//   } catch (error) {
//     console.error(error);
//     alert("Erro ao realizar checkout.");
//   }
// };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        {/* Backdrop com blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    {/* Header do Carrinho */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-2xl font-bold text-white flex items-center gap-3">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Meu Carrinho
                        </Dialog.Title>
                        <button
                          type="button"
                          className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
                          onClick={close}
                        >
                          <span className="sr-only">Fechar</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                      {cart?.items && cart.items.length > 0 && (
                        <p className="mt-2 text-blue-100 text-sm">
                          {cart.items.length} {cart.items.length === 1 ? 'item' : 'itens'} no carrinho
                        </p>
                      )}
                    </div>

                    {/* Lista de Produtos */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      {!cart?.items || cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="bg-gray-100 rounded-full p-8 mb-4">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Seu carrinho está vazio
                          </h3>
                          <p className="text-gray-500 mb-6">
                            Adicione produtos para começar suas compras!
                          </p>
                          <button
                            onClick={close}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                          >
                            Continuar Comprando
                          </button>
                        </div>
                      ) : (
                        <ul role="list" className="space-y-4">
                          {cart.items.map((item) => (
                            <li key={item.productId} className="flex gap-4 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 bg-white">
                                {item.pictureUrl ? (
                                  <img 
                                    src={item.pictureUrl.startsWith('http') ? item.pictureUrl : "https://placehold.co/100x100/png?text=Produto"} 
                                    alt={item.productName} 
                                    className="h-full w-full object-cover object-center" 
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <span className="text-4xl">📦</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-1 flex-col">
                                <div className="flex justify-between">
                                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                                    {item.productName}
                                  </h3>
                                </div>
                                
                                <div className="mt-auto pt-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">Qtd:</span>
                                      <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900">
                                        {item.quantity}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">Preço unitário</p>
                                      <p className="text-lg font-bold text-gray-900">
                                        R$ {item.price.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.productId)}
                                    className="mt-3 w-full text-center text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors"
                                  >
                                    Remover do carrinho
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Footer com Total e Checkout */}
                    {cart?.items && cart.items.length > 0 && (
                      <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-6">
                        <div className="mb-4 space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <p>Subtotal</p>
                            <p className="font-medium">R$ {calculateTotal()?.toFixed(2)}</p>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <p>Frete</p>
                            <p className="font-medium">Calculado no checkout</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-6 pt-4 border-t-2 border-gray-300">
                          <span className="text-lg font-semibold text-gray-900">Total</span>
                          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            R$ {calculateTotal()?.toFixed(2)}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => navigate('/checkout')}
                          disabled={!cart?.items || cart.items.length === 0}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          Finalizar Pedido
                        </button>
                        
                        <button
                          onClick={close}
                          className="w-full mt-3 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium transition-colors"
                        >
                          Continuar Comprando
                        </button>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}