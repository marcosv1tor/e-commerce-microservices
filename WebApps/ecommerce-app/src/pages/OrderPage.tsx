import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { type Order } from '../types/Order';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export function OrdersPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // Busca os pedidos do usuário
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', user],
    queryFn: async () => {
      // Ajuste a rota conforme seu Controller da Order.API
      // Geralmente é: GET /api/v1/order/{userName}
      const response = await api.get<Order[]>(`/order/${user}`); 
      return response.data;
    },
    enabled: !!user, // Só busca se tiver usuário logado
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando seus pedidos...</div>;
  if (isError) return <div className="min-h-screen flex items-center justify-center text-red-500">Erro ao carregar pedidos via Gateway.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header com Voltar */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/catalog')} className="p-2 hover:bg-gray-200 rounded-full">
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
                    <p className="text-sm text-gray-500">Data do Pedido</p>
                    <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-green-600">R$ {order.totalPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                      ${order.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="px-6 py-4">
                  <ul className="divide-y divide-gray-100">
                    {order.orderItems.map((item, index) => (
                      <li key={index} className="py-3 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-xl">
                            📦
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.productName}</p>
                            <p className="text-sm text-gray-500">Qtd: {item.units}</p>
                          </div>
                        </div>
                        <p className="font-medium text-gray-600">R$ {item.unitPrice.toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}