import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Camera, Briefcase, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[var(--color-brand)] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/30">
                CS
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                Civil Smart Store
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Pusat perbelanjaan peralatan teknik sipil dan konstruksi pintar berbasis Internet of Things pertama di Indonesia.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--color-brand)] hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--color-brand)] hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--color-brand)] hover:text-white transition-colors">
                <Camera className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--color-brand)] hover:text-white transition-colors">
                <Briefcase className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Layanan</h3>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-gray-500 hover:text-[var(--color-brand)] text-sm transition-colors">Semua Produk</Link></li>
              <li><Link to="/categories" className="text-gray-500 hover:text-[var(--color-brand)] text-sm transition-colors">Kategori Produk</Link></li>
              <li><Link to="/track" className="text-gray-500 hover:text-[var(--color-brand)] text-sm transition-colors">Lacak Pesanan</Link></li>
              <li><Link to="/faq" className="text-gray-500 hover:text-[var(--color-brand)] text-sm transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Perusahaan</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-500 hover:text-[var(--color-brand)] text-sm transition-colors">Tentang Kami</Link></li>
              <li><Link to="/career" className="text-gray-500 hover:text-[var(--color-brand)] text-sm transition-colors">Karir</Link></li>
              <li><Link to="/blog" className="text-gray-500 hover:text-[var(--color-brand)] text-sm transition-colors">Blog Konstruksi</Link></li>
              <li><Link to="/privacy" className="text-gray-500 hover:text-[var(--color-brand)] text-sm transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Hubungi Kami</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500">Jl. Jenderal Sudirman Kav. 52-53, Jakarta Selatan, 12190</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500">+62 811 2233 4455</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500">cs@civilsmart.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Civil Smart Store. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Metode Pembayaran:</span>
            <div className="flex gap-2">
              <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">BCA</div>
              <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">BNI</div>
              <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">VISA</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
