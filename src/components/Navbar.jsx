import { Link, useLocation } from 'react-router-dom';
import { PackageSearch, Calculator, Activity } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-[var(--color-brand)] rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/30">
          <Activity className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight text-gray-900 hidden sm:block">
          POS Pintar
        </span>
      </Link>

      <div className="flex gap-2 bg-gray-100/50 p-1 rounded-xl border border-gray-100">
        <Link 
          to="/" 
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${location.pathname === '/' ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <Calculator className="w-5 h-5" />
          <span className="hidden sm:inline">Kasir</span>
        </Link>
        <Link 
          to="/manage" 
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${location.pathname === '/manage' ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <PackageSearch className="w-5 h-5" />
          <span className="hidden sm:inline">Kelola Produk</span>
        </Link>
      </div>
    </nav>
  );
}
