import { type Product } from "../types/Product";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";
import { createPortal } from "react-dom";

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    onEdit?: (product: Product) => void;
    isAdmin?: boolean;
}

export function ProductCard({ product, onAddToCart, onEdit, isAdmin }: ProductCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const queryClient = useQueryClient();

    const deleteProductMutation = useMutation({
        mutationFn: async (productId: string) => {
            const response = await api.delete(`/Product/${productId}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalida a query de produtos para recarregar
            queryClient.invalidateQueries({ queryKey: ["products"] });
            setShowDeleteConfirm(false);
        },
        onError: (err: any) => {
            console.error("Erro ao deletar produto:", err);
            setShowDeleteConfirm(false);
        },
    });

    const handleDeleteConfirm = async () => {
        await deleteProductMutation.mutateAsync(product.id.toString());
    };

    return (
    <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 relative">
      {/* Badge Editar (apenas para admin) */}
      {isAdmin && onEdit && (
        <button
          onClick={() => onEdit(product)}
          className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 cursor-pointer z-10 flex items-center justify-center group/edit"
          title="Editar produto"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
      )}

      {/* Imagem com overlay no hover */}
      <div className="relative h-56 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {product.pictureUri ? (
          <img 
            src={product.pictureUri} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="relative">
            <span className="text-7xl opacity-40 group-hover:scale-110 transition-transform duration-300">📦</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 bg-white/80 px-3 py-1 rounded-full">
                Sem imagem
              </span>
            </div>
          </div>
        )}

        {/* Badge de categoria */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-sm text-xs font-bold text-blue-600 uppercase tracking-wider rounded-full shadow-md">
          {product.category}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-500 mb-1 line-clamp-1">
          {product.description}
        </p>
        
        <p className="text-xs text-gray-400 mb-4 line-clamp-2 h-8">
          {product.summary}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-500 block mb-1">Preço</span>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              R$ {product.price.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={() => onAddToCart(product)}
            className="group/btn relative px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar
            </span>
          </button>
        </div>

        {/* Rodapé com botão de excluir (admin) */}
        {isAdmin && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full mt-4 py-2.5 text-red-600 font-semibold text-center rounded-lg hover:bg-red-50 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Excluir Produto
          </button>
        )}

        {/* Dialog de Confirmação */}
        {showDeleteConfirm && createPortal(
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir Produto</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir o produto <strong>{product.name}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteProductMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deleteProductMutation.isPending ? "Deletando..." : "Sim, Excluir"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}