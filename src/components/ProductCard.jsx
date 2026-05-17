import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, StarHalf } from 'lucide-react';
import { formatRupiah } from '../data/products';

export default function ProductCard({ product }) {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.discount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
            Hemat {product.discount}%
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
            Terlaris
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs text-[var(--color-brand)] font-semibold mb-2 uppercase tracking-wider">
          {product.category}
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[var(--color-brand)] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating & Sold */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-500">Terjual {product.sold}</span>
        </div>

        <div className="mt-auto">
          {product.discount > 0 && (
            <div className="text-sm text-gray-400 line-through mb-1">
              {formatRupiah(product.originalPrice)}
            </div>
          )}
          <div className="text-xl font-extrabold text-[var(--color-brand)] mb-4">
            {formatRupiah(product.price)}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link 
              to={`/product/${product.id}`}
              className="flex-1 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 py-2.5 rounded-xl font-semibold text-sm text-center transition-colors"
            >
              Detail
            </Link>
            <button className="flex-1 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/20">
              <ShoppingCart className="w-4 h-4" />
              + Keranjang
            </button>
          </div>
          <div className="mt-3 text-xs text-center text-gray-500">
            Sisa stok: <span className="font-semibold text-gray-700">{product.stock} unit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
