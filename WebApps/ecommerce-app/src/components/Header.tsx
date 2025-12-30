import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCartUiStore } from "../store/useCartUiStore";
import { Menu, Transition } from "@headlessui/react";
import { ArrowRightOnRectangleIcon, ChevronDownIcon, ShoppingCartIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react/jsx-runtime";
import type { ShoppingCart } from "../types/Basket";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";
import { CartSidebar } from "./CartSideBar";

export default function Header() {

    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const { open } = useCartUiStore(); // Hook para abrir carrinho

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

    let role = localStorage.getItem("user_role");

    const isAdmin = () => {
        if (role === "Admin") {
            role = "Administrador";
            return true;
        }
    }

    return (
        <div>
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
                                onClick={() => open()}
                                className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200 cursor-pointer"
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
                                        <Menu.Button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 group cursor-pointer">
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
                                                                className={`${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                                                    } group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors cursor-pointer`}
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
                                                                className={`${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                                                    } group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors cursor-pointer`}
                                                                onClick={() => navigate('/profile')}
                                                            >
                                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                Meu Perfil
                                                            </button>
                                                        )}
                                                    </Menu.Item>

                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                className={`${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                                                    } group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors cursor-pointer`}
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
                                                                className={`${active ? 'bg-red-50 text-red-600' : 'text-red-600'
                                                                    } group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer`}
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
                             {isAdmin() && (
                                <div className="bg-green-100 text-blue-800 px-3 py-1 rounded-full border border-green-200">
                                    <div className="text-center">
                                        <p className="text-s text-center font-bold text-gray-900">{role}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </div>

    );
}