import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Trash2, Minus, Image as ImageIcon, Home, Info, UploadCloud, CheckCircle2, Box, X } from 'lucide-react';
import { formatRupiah } from '../data/products';
import toast, { Toaster } from 'react-hot-toast';

export default function POS() {
  const [products, setProducts] = useState([]);
  
  
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('neoPosCart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('neoPosCart', JSON.stringify(cart));
  }, [cart]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  
  
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: '', image: '' });

  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      
      
      setCart(prevCart => {
        const validCart = prevCart.filter(cartItem => 
          productsData.some(p => p.id === cartItem.id)
        );
        if (validCart.length !== prevCart.length) {
          return validCart;
        }
        return prevCart;
      });
    }, (error) => {
      console.error("Firebase Error:", error);
    });
    
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['Semua', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (filter !== 'Semua') result = result.filter(p => p.category === filter);
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [products, filter, search]);

  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar terlalu besar! Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); 
          setFormData({ ...formData, image: compressedBase64 });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const { name, price, stock, category, image } = formData;
    if (!name || !price || !stock || !category) return toast.error('Mohon lengkapi data!');
    
    try {
      await addDoc(collection(db, "products"), {
        name, 
        price: Number(price), 
        stock: Number(stock), 
        category, 
        image: image || ''
      });
      toast.success('Produk berhasil disimpan!');
      setIsAddModalOpen(false);
      setFormData({ name: '', price: '', stock: '', category: '', image: '' });
    } catch (error) {
      console.error("Save Error:", error);
      toast.error('Error: ' + error.message);
    }
  };

  
  const addToCart = (product) => {
    if (product.stock <= 0) return toast.error('Stok produk habis!');
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('Maksimal stok tercapai!');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success('Masuk keranjang');
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const requestRemoveFromCart = (id) => {
    setConfirmModal({ isOpen: true, type: 'cart', id });
  };

  const requestCheckout = () => {
    if (cart.length === 0) return;
    setConfirmModal({ isOpen: true, type: 'checkout', id: null });
  };

  const requestDeleteProduct = (id, e) => {
    e.stopPropagation();
    setConfirmModal({ isOpen: true, type: 'product', id });
  };

  const handleConfirmAction = async () => {
    if (confirmModal.type === 'product') {
      try {
        await deleteDoc(doc(db, "products", confirmModal.id));
        toast.success('Produk berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus produk!');
      }
    } else if (confirmModal.type === 'cart') {
      setCart(prev => prev.filter(i => i.id !== confirmModal.id));
      toast.success('Dihapus dari keranjang');
    } else if (confirmModal.type === 'checkout') {
      try {
        const batch = writeBatch(db);
        for (const item of cart) {
          const productRef = doc(db, "products", item.id);
          const originalProduct = products.find(p => p.id === item.id);
          if (originalProduct) {
            batch.update(productRef, { stock: originalProduct.stock - item.quantity });
          }
        }
        await batch.commit();
        
        toast.success(`Pembayaran ${paymentMethod} berhasil! Stok diperbarui.`);
        setCart([]);
        setIsCartOpen(false);
      } catch (error) {
        console.error(error);
        toast.error('Gagal memproses transaksi!');
      }
    }
    setConfirmModal({ isOpen: false, type: null, id: null });
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <Toaster position="top-center" toastOptions={{ className: 'font-semibold shadow-lg' }} />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 bg-white border-r border-slate-200 z-10 transition-all duration-300">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
            <Box className="w-6 h-6" />
          </div>
          <span className="hidden lg:block ml-3 font-extrabold text-xl tracking-tight text-slate-900">
            NeoPOS
          </span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-3 lg:px-4">
          <button onClick={() => { setFilter('Semua'); setSearch(''); }} className="flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold transition-all">
            <Home className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">Beranda Menu</span>
          </button>
          <button onClick={() => toast('Pilih produk > Masuk keranjang > Proses Bayar')} className="flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 font-semibold transition-all">
            <Info className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">Cara Penggunaan</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full relative pb-16 md:pb-0">
        
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
          <div className="flex-1 max-w-lg">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama produk..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200/50 transition-colors border-none rounded-full py-3 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5 ml-4 shrink-0">
            <button 
              onClick={() => setIsAddModalOpen(true)} 
              className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" /> 
              Tambah Produk
            </button>
            
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="hidden md:flex relative p-3 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-full transition-all shadow-sm active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* PRODUCT SECTION */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-6 hide-scrollbar items-center">
              <span className="text-sm font-bold text-slate-400 mr-2 shrink-0">Filter:</span>
              {categories.map(c => (
                <button 
                  key={c} 
                  onClick={() => setFilter(c)} 
                  className={`shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all ${filter === c ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-800'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 pb-24 md:pb-8">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col">
                  
                  {/* Delete Button (Hover on Desktop, Always Visible on Mobile) */}
                  <button 
                    onClick={(e) => requestDeleteProduct(product.id, e)}
                    className="absolute top-2 right-2 sm:top-5 sm:right-5 bg-white/90 backdrop-blur text-red-500 p-1.5 sm:p-2 rounded-full z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shadow-md hover:bg-red-50 hover:scale-110"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Image */}
                  <div className="aspect-square rounded-2xl bg-slate-50 relative overflow-hidden mb-4 shrink-0 border border-slate-50">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-10 h-10" /></div>
                    )}
                    
                    {/* Badge Stock */}
                    {product.stock <= 0 ? (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">HABIS</div>
                    ) : (
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                        Sisa: {product.stock}
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                    <div className="flex flex-col flex-1 px-1">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">{product.category}</span>
                      <h3 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                      
                      <div className="mt-auto flex items-end justify-between">
                        <div className="font-black text-slate-900 text-sm sm:text-lg">
                          {formatRupiah(product.price)}
                        </div>
                        <button 
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0"
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5 font-bold" />
                        </button>
                      </div>
                    </div>
                </div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak ada produk</h3>
                <p className="text-slate-500 max-w-sm">Katalog kosong. Silakan tambah produk baru.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around items-center h-16 z-30 pb-safe">
        <button onClick={() => { setFilter('Semua'); setSearch(''); window.scrollTo(0,0); }} className="flex flex-col items-center justify-center w-full h-full text-indigo-600">
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <div className="w-full flex justify-center -mt-6">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 border-4 border-slate-50 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-slate-800 relative">
          <ShoppingBag className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Keranjang</span>
          {cartItemCount > 0 && (
            <span className="absolute top-1 right-8 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {cartItemCount}
            </span>
          )}
        </button>
      </nav>

      {/* RIGHT SIDEBAR CART */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-[90%] sm:w-[400px] max-w-full bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 rounded-l-2xl sm:rounded-l-3xl overflow-hidden ml-auto">
            
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 sm:gap-3">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                Pesanan Saat Ini
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-slate-400 mt-20 flex flex-col items-center">
                  <ShoppingBag className="w-16 h-16 mb-4 text-slate-200" />
                  <p className="font-medium text-slate-500">Keranjang masih kosong</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 group relative">
                    <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 shrink-0" />
                    <div className="flex-1 flex flex-col py-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 pr-6 leading-tight">{item.name}</h4>
                      <div className="text-indigo-600 font-extrabold text-xs sm:text-sm mt-1">{formatRupiah(item.price)}</div>
                      
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900">
                            <Minus className="w-3 h-3 font-bold" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center text-slate-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900">
                            <Plus className="w-3 h-3 font-bold" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => requestRemoveFromCart(item.id)} className="absolute top-1 right-0 text-slate-300 hover:text-red-500 p-1 transition-colors" title="Hapus dari Keranjang">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 shrink-0">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <span className="text-sm sm:text-base text-slate-500 font-bold">Total Pembayaran</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">{formatRupiah(total)}</span>
              </div>
              <button 
                onClick={requestCheckout} 
                disabled={cart.length === 0} 
                className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all ${cart.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 active:scale-[0.98]'}`}
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <h2 className="text-xl font-extrabold text-slate-900">Tambah Produk Baru</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 overflow-y-auto bg-slate-50/50">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Produk</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm" placeholder="Contoh: Palu Baja Murni" />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Harga Jual (Rp)</label>
                  <input required type="text" inputMode="numeric" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value.replace(/\D/g, '')})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Stok Awal</label>
                  <input required type="text" inputMode="numeric" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value.replace(/\D/g, '')})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm" placeholder="0" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kategori Baru / Eksisting</label>
                <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm" placeholder="Contoh: Alat Berat, Pakaian" />
              </div>
              
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700">Upload Foto Produk</label>
                  <span className="text-xs font-medium text-slate-500">Maksimal 5MB</span>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                  {formData.image ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1 w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer outline-none" 
                  />
                </div>
              </div>
              
              <div className="pt-4 sm:pt-6 flex gap-3 sm:gap-4 shrink-0 border-t border-slate-200 mt-4 sm:mt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 sm:py-4 bg-white border border-slate-200 text-slate-700 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm sm:text-base">Batalkan</button>
                <button type="submit" className="flex-1 py-3 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 flex justify-center items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmModal({ isOpen: false, type: null, id: null })}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden text-center p-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'checkout' ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-500'}`}>
              {confirmModal.type === 'checkout' ? <CheckCircle2 className="w-8 h-8" /> : <Trash2 className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              {confirmModal.type === 'checkout' ? 'Proses Pembayaran' : 'Konfirmasi Hapus'}
            </h3>
            <p className={`text-slate-500 ${confirmModal.type === 'checkout' ? 'mb-4' : 'mb-6'}`}>
              {confirmModal.type === 'product' && 'Anda yakin ingin menghapus produk ini secara permanen?'}
              {confirmModal.type === 'cart' && 'Yakin ingin menghapus produk ini dari keranjang?'}
              {confirmModal.type === 'checkout' && `Total tagihan: `}
              {confirmModal.type === 'checkout' && <span className="font-black text-slate-900">{formatRupiah(total)}</span>}
            </p>

            {confirmModal.type === 'checkout' && (
              <div className="mb-6">
                <div className="text-sm font-bold text-slate-700 mb-3 text-left">Metode Pembayaran:</div>
                <div className="grid grid-cols-2 gap-3">
                  {['Cash', 'QRIS', 'Debit Card', 'Transfer'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-1.5 ${paymentMethod === method ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, type: null, id: null })} 
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmAction} 
                className={`flex-1 py-3 text-white rounded-xl font-bold transition-colors shadow-lg ${confirmModal.type === 'checkout' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'}`}
              >
                {confirmModal.type === 'checkout' ? 'Ya, Bayar' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
