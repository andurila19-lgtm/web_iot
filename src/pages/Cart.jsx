import { Link } from 'react-router-dom';
import { products, formatRupiah } from '../data/products';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    { ...products[0], quantity: 1 },
    { ...products[2], quantity: 2 }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items => 
      items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Trash2 className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Belanja Kosong</h2>
        <p className="text-gray-500 mb-8 text-center">Anda belum menambahkan peralatan pintar apa pun ke keranjang.</p>
        <Link to="/products" className="bg-[var(--color-brand)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--color-brand-hover)] transition-colors">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Keranjang Belanja</h1>
      
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 w-full">
                <div className="text-sm text-[var(--color-brand)] font-semibold mb-1">{item.category}</div>
                <Link to={`/product/${item.id}`} className="font-bold text-lg text-gray-900 hover:text-[var(--color-brand)] transition-colors mb-2 block line-clamp-1">
                  {item.name}
                </Link>
                <div className="font-extrabold text-[var(--color-brand)] text-xl mb-4">
                  {formatRupiah(item.price)}
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-gray-500 hover:text-[var(--color-brand)]">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-gray-500 hover:text-[var(--color-brand)]">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm font-medium">
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-28">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Ringkasan Pesanan</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Total Harga ({cartItems.length} barang)</span>
                <span className="font-medium text-gray-900">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>PPN (11%)</span>
                <span className="font-medium text-gray-900">{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Biaya Pengiriman</span>
                <span className="font-medium text-[var(--color-brand)]">Gratis</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-8 flex justify-between items-end">
              <span className="font-bold text-gray-900">Total Belanja</span>
              <span className="text-2xl font-black text-[var(--color-brand)]">{formatRupiah(total)}</span>
            </div>
            
            <button className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5">
              Lanjut ke Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
              Pembayaran aman dan dienkripsi 256-bit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
