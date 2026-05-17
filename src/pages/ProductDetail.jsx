import { useParams, Link } from 'react-router-dom';
import { products, formatRupiah } from '../data/products';
import { Star, StarHalf, Shield, Truck, Package, Heart, Share2, Minus, Plus, ShoppingCart, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-gray-400">Produk tidak ditemukan.</div>;
  }

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
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-500 hover:text-[var(--color-brand)]">Beranda</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/products" className="text-gray-500 hover:text-[var(--color-brand)]">Produk</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="aspect-square bg-gray-50 rounded-xl border-2 border-transparent hover:border-emerald-500 cursor-pointer overflow-hidden transition-colors">
                  <img src={product.image} alt="Gallery" className="w-full h-full object-cover opacity-70 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Header info */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-100 text-[var(--color-brand)] text-xs font-bold rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-bold text-gray-900 mr-1">{product.rating}</span>
                <span className="text-gray-500">({product.reviews} ulasan)</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-gray-500">Terjual {product.sold}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-end gap-4 mb-6">
              <div className="text-4xl font-black text-[var(--color-brand)]">
                {formatRupiah(product.price)}
              </div>
              {product.discount > 0 && (
                <>
                  <div className="text-xl text-gray-400 line-through mb-1">
                    {formatRupiah(product.originalPrice)}
                  </div>
                  <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold mb-1">
                    -{product.discount}%
                  </div>
                </>
              )}
            </div>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Actions */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">Atur Jumlah</span>
                <span className="text-sm text-gray-500">Sisa stok: <span className="font-bold text-gray-900">{product.stock}</span></span>
              </div>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-500 hover:text-[var(--color-brand)] transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 text-gray-500 hover:text-[var(--color-brand)] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-right flex-1">
                  <div className="text-sm text-gray-500">Subtotal</div>
                  <div className="font-bold text-xl text-gray-900">{formatRupiah(product.price * quantity)}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex-1 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5">
                  <ShoppingCart className="w-5 h-5" />
                  Tambah ke Keranjang
                </button>
                <button className="p-4 border border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50 text-gray-600 hover:text-[var(--color-brand)] rounded-xl transition-all">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="p-4 border border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50 text-gray-600 hover:text-[var(--color-brand)] rounded-xl transition-all">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-600">Garansi Resmi 1 Tahun</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-600">Pasti Original</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-[var(--color-brand)]">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-600">Gratis Ongkir</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs */}
        <div className="mt-20">
          <div className="border-b border-gray-200 flex gap-8">
            <button className="pb-4 text-[var(--color-brand)] font-bold border-b-2 border-[var(--color-brand)] text-lg">
              Detail Produk
            </button>
            <button className="pb-4 text-gray-500 hover:text-gray-900 font-medium text-lg">
              Spesifikasi
            </button>
            <button className="pb-4 text-gray-500 hover:text-gray-900 font-medium text-lg">
              Ulasan ({product.reviews})
            </button>
          </div>
          
          <div className="py-8 grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Deskripsi Lengkap</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.fullDescription}
              </p>
              
              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Keunggulan Utama</h3>
              <ul className="space-y-3">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-brand)]"></div>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Estimasi Pengiriman</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Kurir Reguler</span>
                    <span className="font-medium text-gray-900">2 - 3 Hari</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Kurir Instan</span>
                    <span className="font-medium text-gray-900">Hari ini</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Kargo (Alat Berat)</span>
                    <span className="font-medium text-gray-900">3 - 7 Hari</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
