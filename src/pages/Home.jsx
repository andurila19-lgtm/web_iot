import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { ArrowRight, Zap, Shield, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Features Banner */}
      <div className="bg-gray-50 py-12 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-7 h-7 text-[var(--color-brand)]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Pengiriman Cepat</h4>
                <p className="text-sm text-gray-500">Ke seluruh proyek di Indonesia</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Garansi Resmi</h4>
                <p className="text-sm text-gray-500">Jaminan produk IoT original</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Headphones className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Dukungan Teknis</h4>
                <p className="text-sm text-gray-500">Tim ahli siap membantu 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Products */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Produk Unggulan</h2>
              <p className="text-gray-500">Peralatan cerdas terpopuler bulan ini untuk proyek Anda.</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-2 text-[var(--color-brand)] font-semibold hover:text-[var(--color-brand-hover)] transition-colors">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center sm:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 text-[var(--color-brand)] font-semibold px-6 py-3 border border-emerald-200 rounded-full hover:bg-emerald-50 transition-colors">
              Lihat Semua Produk <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Category Section Preview */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-12 text-center">Jelajahi Kategori</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Sensor IoT', 'Monitoring Visual', 'Keselamatan Pintar', 'Alat Survey'].map((category, idx) => (
              <div key={idx} className="group cursor-pointer bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
                <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full group-hover:scale-110 transition-transform"></div>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-brand)] transition-colors">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
