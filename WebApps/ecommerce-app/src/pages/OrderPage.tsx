import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { type Order, type OrderDetail } from '../types/Order';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { createPortal } from 'react-dom';

export function OrdersPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Verificar se é admin
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    setIsAdminUser(role === "Admin");
  }, []);
  // Busca os pedidos do usuário
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', user],
    queryFn: async () => {
      // Ajuste a rota conforme seu Controller da Order.API
      // Geralmente é: GET /api/v1/order/{userName}
      const response = await api.get<Order[]>(`/order`); 
      return response.data;
    },
    enabled: !!user, // Só busca se tiver usuário logado
  });

  // Mutation para deletar pedido
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.delete(`/order/${orderId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user] });
      setShowDeleteConfirm(null);
    },
    onError: (err: any) => {
      console.error("Erro ao deletar pedido:", err);
      setShowDeleteConfirm(null);
    },
  });
  const { data: orderDetail } = useQuery({
  queryKey: ['orderDetail', selectedOrderId],
  queryFn: async () => {
    const response = await api.get<OrderDetail>(`/order/${selectedOrderId}`);
    return response.data;
  },
  enabled: !!selectedOrderId, // só busca se houver id selecionado
});
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando seus pedidos...</div>;
  if (isError) return <div className="min-h-screen flex items-center justify-center text-red-500">Erro ao carregar pedidos via Gateway.</div>;

  return (
      <div>
        <Header />
      <div className="max-w-4xl mx-auto mt-8 p-4">
        {/* Header com Voltar */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/catalog')} className="p-2 hover:bg-gray-200 rounded-full cursor-pointer">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-6">
          {orders?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <span className="text-4xl">📭</span>
              <p className="mt-4 text-gray-500">Você ainda não fez nenhum pedido.</p>
            </div>
          ) : (
            orders?.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                {/* Cabeçalho do Pedido */}
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">Pedido #{order.orderCode}</p>
                    <p className="text-sm text-gray-500">Data: {new Date(order.orderDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Ver detalhes
                    </button>
                    {isAdminUser && (
                      <button
                        onClick={() => setShowDeleteConfirm(order.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2"
                        title="Deletar pedido"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Deletar</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Itens do Pedido */}
                {selectedOrderId === order.id && orderDetail && (
                    <div className="px-6 py-4">
                        <h3 className="text-lg font-bold mb-4">Itens do Pedido - Status: {order.status}</h3>
                        <ul className="divide-y divide-gray-100">
                        {orderDetail.orderItems.map((item, index) => (
                            <li key={index} className="py-3 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-xl">
                                    <img src={item.pictureUrl} alt={item.productName} />
                                </div>
                                <div>
                                <p className="font-medium text-gray-800">{item.productName}</p>
                                <p className="text-sm text-gray-500">Qtd: {item.units}</p>
                                </div>
                            </div>
                            <p className="font-medium text-gray-600">
                                R$ {item.unitPrice.toFixed(2)}
                            </p>
                            </li>
                        ))}
                        </ul>
                    </div>
                    )}

                {/* Dialog de Confirmação de Deleção */}
                {showDeleteConfirm === order.id && createPortal(
                  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Deletar Pedido</h3>
                      <p className="text-gray-600 mb-6">
                        Tem certeza que deseja deletar o pedido <strong>#{order.orderCode}</strong>? Esta ação não pode ser desfeita.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => deleteOrderMutation.mutate(order.id)}
                          disabled={deleteOrderMutation.isPending}
                          className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {deleteOrderMutation.isPending ? "Deletando..." : "Sim, Deletar"}
                        </button>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}