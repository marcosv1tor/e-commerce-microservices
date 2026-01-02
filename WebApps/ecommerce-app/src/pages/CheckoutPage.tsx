import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCartUiStore } from "../store/useCartUiStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ShoppingCart } from "../types/Basket";
import { api } from "../api/axios";
import { useState } from "react";
import Header from "../components/Header";

export function CheckoutPage() {

    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const { open } = useCartUiStore(); // Hook para abrir carrinho
    const queryClient = useQueryClient(); // Para atualizar cache

    // Estado do formulário
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil',
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });

    const [isProcessing, setIsProcessing] = useState(false);

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
    const totalPrice = cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

    const maskCardNumber = (value: string) => {
        return value
            .replace(/\D/g, "")                    // Remove tudo o que não é dígito
            .replace(/(\d{4})(\d)/, "$1 $2")       // Adiciona espaço após o quarto dígito
            .replace(/(\d{4})(\d)/, "$1 $2")       // Adiciona espaço após o oitavo dígito
            .replace(/(\d{4})(\d)/, "$1 $2")       // Adiciona espaço após o décimo segundo dígito
            .replace(/(\d{4})\d+?$/, "$1");        // Limita a 16 dígitos (mais espaços)
    };

    const maskExpiryDate = (value: string) => {
        return value
            .replace(/\D/g, "")                    // Remove tudo o que não é dígito
            .replace(/(\d{2})(\d)/, "$1/$2")       // Adiciona a barra após o segundo dígito
            .replace(/(\d{2})(\d{2})\d+?$/, "$1/$2"); // Limita a 5 caracteres (MM/YY)
    };

    const maskCVV = (value: string) => {
        return value
            .replace(/\D/g, "")                    // Remove tudo o que não é dígito
            .slice(0, 3);                          // Limita a 4 dígitos (padrão Amex)
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let maskedValue = value;

        if (name === "cardNumber") maskedValue = maskCardNumber(value);
        if (name === "expiryDate") maskedValue = maskExpiryDate(value);
        if (name === "cvv") maskedValue = maskCVV(value);
        setFormData(prev => ({ ...prev, [name]: maskedValue }));
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cart || cart.items.length === 0) return;
        if (!formData.fullName || !formData.street || !formData.city) {
            alert('❌ Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setIsProcessing(true);

        // Checkout payload com dados do formulário
        const payload = {
            address: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                zipCode: formData.zipCode,
            },
            items: cart.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                unitPrice: item.price,
                units: item.quantity,
                pictureUrl: item.pictureUrl || "",
            })),
        };

        try {
            await api.post("/order/checkout", payload);
            alert("✅ Pedido Realizado com Sucesso!");
            setFormData({
                fullName: '',
                email: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'Brasil',
                cardholderName: '',
                cardNumber: '',
                expiryDate: '',
                cvv: '',
            });
            // Limpar carrinho completamente
            if (cart && cart.items.length > 0) {
                updateBasketMutation.mutate({ ...cart, items: [] });
            }
            queryClient.invalidateQueries({ queryKey: ['basket', user] });
            navigate('/orders');
        } catch (error) {
            console.error(error);
            alert("❌ Erro ao realizar checkout. Tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

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


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Por favor, faça login para continuar.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
           <Header />
            {/* Conteúdo Principal */}
            <main className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulário de Checkout */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleCheckout} className="space-y-8">
                            {/* Seção de Informações Pessoais */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                    Informações Pessoais
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="João da Silva"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="seu@email.com"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção de Endereço */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                    Endereço de Entrega
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Rua e Número *</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Rua Principal, 123"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="São Paulo"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                placeholder="SP"
                                                maxLength={2}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">CEP</label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleInputChange}
                                                placeholder="12345-000"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">País</label>
                                            <select
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                            >
                                                <option>Brasil</option>
                                                <option>Portugal</option>
                                                <option>Outro</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seção de Pagamento */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                                    Informações de Pagamento
                                </h2>

                                <div className="mb-6">
                                    <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        💳 Este é um ambiente de teste. Use dados fictícios para o cartão.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Titular do Cartão</label>
                                        <input
                                            type="text"
                                            name="cardholderName"
                                            value={formData.cardholderName}
                                            onChange={handleInputChange}
                                            placeholder="João Silva"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Número do Cartão</label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleInputChange}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Validade</label>
                                            <input
                                                type="text"
                                                name="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={handleInputChange}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={formData.cvv}
                                                onChange={handleInputChange}
                                                placeholder="123"
                                                maxLength={4}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botão de Finalizar */}
                            <button
                                type="submit"
                                disabled={isProcessing || !cart || cart.items.length === 0}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg cursor-pointer"
                            >
                                {isProcessing ? '⏳ Processando...' : '✓ Finalizar Pedido'}
                            </button>
                        </form>
                    </div>

                    {/* Resumo do Carrinho */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-8 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h3>

                            {cart && cart.items.length > 0 ? (
                                <>
                                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                                        {cart.items.map((item) => (
                                            <div key={item.productId} className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                                                    <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    R$ {(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Subtotal ({totalItems} itens)</span>
                                            <span>R$ {totalPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Frete</span>
                                            <span>R$ 0,00</span>
                                        </div>
                                        <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                            <span>Total</span>
                                            <span className="text-blue-600">R$ {totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/catalog')}
                                        className="w-full mt-6 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm cursor-pointer"
                                    >
                                        ← Voltar ao Catálogo
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
                                    <button
                                        onClick={() => navigate('/catalog')}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer"
                                    >
                                        Adicionar Produtos
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}