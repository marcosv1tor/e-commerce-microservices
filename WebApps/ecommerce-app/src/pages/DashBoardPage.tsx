import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import type { Order } from '../types/Order';
import type { ProductResponse } from '../types/ProductResponse';
import { ChartBarIcon, ShoppingBagIcon, UsersIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

export function DashBoardPage() {
  const navigate = useNavigate();
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Verificar se é admin ao montar o componente
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    setIsAdminUser(role === "Admin");
    
    if (role !== "Admin") {
      // Se não for admin, redireciona para catálogo
      navigate('/catalog');
    }
  }, [navigate]);

  // Busca todos os pedidos
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      const response = await api.get<Order[]>('/order');
      return response.data;
    },
    enabled: isAdminUser,
  });

  // Busca todos os produtos
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get<ProductResponse>('/product');
      return response.data;
    },
    enabled: isAdminUser,
  });

  // Cálculos de estatísticas
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.items?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.totalPrice, 0) || 0;
  
  // Pedidos recentes (últimos 5)
  const recentOrders = orders?.slice(-5).reverse() || [];
  
  // Produtos recentes (últimos 5)
  const recentProducts = products?.items?.slice(-5).reverse() || [];

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendente';
      case 'paid':
        return 'Pago';
      case 'shipped':
        return 'Enviado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (!isAdminUser) {
    return null; // Ou um loader enquanto redireciona
  }

  if (loadingOrders || loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-4"></div>
          <p className="text-white text-xl font-semibold">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600">
            Visão geral das movimentações e estatísticas do sistema
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Pedidos */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalOrders}</h3>
            <p className="text-gray-600 text-sm">Pedidos Realizados</p>
          </div>

          {/* Total de Produtos */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Catálogo
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalProducts}</h3>
            <p className="text-gray-600 text-sm">Produtos Cadastrados</p>
          </div>

          {/* Receita Total */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Receita
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              R$ {totalRevenue.toFixed(2)}
            </h3>
            <p className="text-gray-600 text-sm">Receita Total</p>
          </div>

          {/* Usuários Ativos */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <UsersIcon className="w-8 h-8 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Ativos
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {[...new Set(orders?.map(o => o.userName))].length || 0}
            </h3>
            <p className="text-gray-600 text-sm">Usuários com Pedidos</p>
          </div>
        </div>

        {/* Two Column Layout for Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                  Pedidos Recentes
                </h2>
                <button
                  onClick={() => navigate('/orders')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Ver todos →
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum pedido registrado ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            #{order.orderCode}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Cliente: <span className="font-medium">{order.userName}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          R$ {order.totalPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.orderItems?.length || 0} {order.orderItems?.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  Produtos Cadastrados
                </h2>
                <button
                  onClick={() => navigate('/catalog')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
                >
                  Ver catálogo →
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentProducts.length === 0 ? (
                <div className="text-center py-8">
                  <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum produto cadastrado ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                        {product.pictureUri ? (
                          <img
                            src={product.pictureUri}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ChartBarIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {product.category}
                        </p>
                        {product.units !== undefined && (
                          <p className="text-xs text-gray-500">
                            Estoque: {product.units} unidades
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Resumo de Atividades</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Pedidos Pendentes</p>
              <p className="text-3xl font-bold">
                {orders?.filter(o => o.status.toLowerCase() === 'pending').length || 0}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Pedidos Pagos</p>
              <p className="text-3xl font-bold">
                {orders?.filter(o => o.status.toLowerCase() === 'paid').length || 0}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Ticket Médio</p>
              <p className="text-3xl font-bold">
                R$ {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

