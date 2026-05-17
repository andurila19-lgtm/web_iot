import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white/50 backdrop-blur-3xl"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 rounded-l-[100px] transform translate-x-1/3"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-pulse"></span>
              Peralatan Konstruksi Pintar Masa Depan
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
              Peralatan Teknik Sipil Pintar untuk <span className="text-[var(--color-brand)]">Konstruksi Modern</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              Solusi teknologi berbasis Internet of Things untuk meningkatkan efisiensi, keamanan, dan monitoring proyek konstruksi.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/products" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-brand)] text-white rounded-full font-semibold hover:bg-[var(--color-brand-hover)] transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5">
                <ShoppingBag className="w-5 h-5" />
                Belanja Sekarang
              </Link>
              <Link to="/categories" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                Lihat Produk
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-[3rem] transform rotate-3 scale-105 opacity-50 blur-2xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1541888081622-1d54f7622877?auto=format&fit=crop&q=80&w=1200" 
              alt="Konstruksi Modern IoT" 
              className="relative rounded-[2rem] shadow-2xl object-cover w-full h-full max-h-[500px] lg:max-h-full border-8 border-white"
            />
            
            {/* Floating Badges */}
            <div className="absolute top-8 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">IoT</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Terhubung</p>
                <p className="font-bold text-gray-900">Real-time Data</p>
              </div>
            </div>
            
            <div className="absolute bottom-12 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-[var(--color-brand)] font-bold">AI</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Akurasi</p>
                <p className="font-bold text-gray-900">Tinggi & Presisi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
