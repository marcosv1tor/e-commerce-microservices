import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";
import type { NewProduct } from "../types/Product";

interface AddProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddProductDialog({ isOpen, onClose }: AddProductDialogProps) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<NewProduct>({
        Name: "",
        Description: "",
        Price: 0,
        PictureUri: "",
        Category: "",
        Stock: 0,
    });

    const [error, setError] = useState<string | null>(null);

    const addProductMutation = useMutation({
        mutationFn: async (product: NewProduct) => {
            const response = await api.post("/product", product);
            return response.data;
        },
        onSuccess: () => {
            // Invalida a query de produtos para recarregar
            queryClient.invalidateQueries({ queryKey: ["products"] });
            // Limpa o formulário
            setFormData({
                Name: "",
                Description: "",
                Price: 0,
                PictureUri: "",
                Category: "",
                Stock: 0,
            });
            setError(null);
            // Fecha o dialog
            onClose();
        },
        onError: (err: any) => {
            setError(
                err.response?.data?.message ||
                "Erro ao criar produto. Tente novamente."
            );
        },
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "Price" || name === "Stock" ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validação básica
        if (
            !formData.Name ||
            !formData.Description ||
            !formData.Category ||
            formData.Price <= 0 ||
            formData.Stock < 0
        ) {
            setError("Por favor, preencha todos os campos corretamente");
            return;
        }

        setIsLoading(true);
        try {
            await addProductMutation.mutateAsync(formData);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                                        Adicionar Novo Produto
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Erro */}
                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Formulário */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Nome */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nome do Produto *
                                        </label>
                                        <input
                                            type="text"
                                            name="Name"
                                            value={formData.Name}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Notebook Samsung"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            required
                                        />
                                    </div>

                                    {/* Descrição */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Descrição *
                                        </label>
                                        <textarea
                                            name="Description"
                                            value={formData.Description}
                                            onChange={handleInputChange}
                                            placeholder="Descreva o produto..."
                                            rows={3}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                                            required
                                        />
                                    </div>

                                    {/* Grid 2 colunas */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Preço */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Preço (R$) *
                                            </label>
                                            <input
                                                type="number"
                                                name="Price"
                                                value={formData.Price || ""}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                required
                                            />
                                        </div>

                                        {/* Estoque */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Estoque (unidades) *
                                            </label>
                                            <input
                                                type="number"
                                                name="Stock"
                                                value={formData.Stock || ""}
                                                onChange={handleInputChange}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Categoria */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Categoria *
                                        </label>
                                        <select
                                            name="Category"
                                            value={formData.Category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                            required
                                        >
                                            <option value="">Selecione uma categoria</option>
                                            <option value="Eletrônicos">Eletrônicos</option>
                                            <option value="Computadores">Computadores</option>
                                            <option value="Periféricos">Periféricos</option>
                                            <option value="Acessórios">Acessórios</option>
                                            <option value="Smartphones">Smartphones</option>
                                            <option value="Tablets">Tablets</option>
                                        </select>
                                    </div>

                                    {/* URL da Imagem */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            URL da Imagem
                                        </label>
                                        <input
                                            type="url"
                                            name="PictureUri"
                                            value={formData.PictureUri}
                                            onChange={handleInputChange}
                                            placeholder="https://exemplo.com/imagem.jpg"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                        {formData.PictureUri && (
                                            <div className="mt-3 flex items-center gap-3">
                                                <span className="text-sm text-gray-600">Preview:</span>
                                                <img
                                                    src={formData.PictureUri}
                                                    alt="Preview"
                                                    className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                                                    onError={() => {
                                                        // Se falhar, mostra placeholder
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Botões */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors cursor-pointer"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {isLoading ? "Salvando..." : "Adicionar Produto"}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
