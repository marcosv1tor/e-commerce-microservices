import { type Product } from "../types/Product";

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    return (
    <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      {/* Imagem com overlay no hover */}
      <div className="relative h-56 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {product.pictureUrl ? (
          <img 
            src={product.pictureUrl} 
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
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
      </div>
    </div>
  );
}