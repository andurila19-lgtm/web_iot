import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, query, where, orderBy } from 'firebase/firestore';
import { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Search, Trash2, Pencil, Minus, Image as ImageIcon, 
  Home, Info, UploadCloud, CheckCircle2, Box, X, Heart, Mail, Phone, 
  User, History, LogOut, Lock, MessageSquare, Clock, Copy, ChevronRight, 
  QrCode, Activity, Wifi, Battery, MapPin, AlertTriangle, Cpu, Layers, 
  Globe, Sliders, Radio, Signal, Sprout, Sparkles
} from 'lucide-react';
import { formatRupiah } from '../data/products';
import toast, { Toaster } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [editingId, setEditingId] = useState(null);
  const [detailModalProduct, setDetailModalProduct] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  
  // Navigation / Tabs State
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'dashboard', 'history', 'contact', 'login'
  
  // Advanced Marketplace Filter States
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterProtocol, setFilterProtocol] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterSort, setFilterSort] = useState('Terbaru');
  const [customerName, setCustomerName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('JNE');

  // Firebase Auth State (Login feature removed/bypassed)
  const [currentUser, setCurrentUser] = useState({ email: 'guest@smartfarming.id', uid: 'guest_user_uid' });
  
  // QRIS Payment Modal State
  const [isQRISModalOpen, setIsQRISModalOpen] = useState(false);
  const [qrisTimer, setQrisTimer] = useState(300); // 5 minutes
  
  // Contact Us Message State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  
  // Order History state
  const [orders, setOrders] = useState([]);

  // Telemetry Simulation States for Dashboard
  const [simulatedChartData, setSimulatedChartData] = useState([30, 45, 35, 60, 40, 75, 50, 90, 85]);
  const [simulatedLogs, setSimulatedLogs] = useState([
    { id: 1, time: '15:30:22', type: 'WARNING', msg: 'Battery Low at Fleet IoT Node B (12%)' },
    { id: 2, time: '15:28:10', type: 'INFO', msg: 'GPS coordinates updated for Smart Asset Tracking Node' },
    { id: 3, time: '15:25:45', type: 'CRITICAL', msg: 'Sensor Temperature Alert at Node A (27.2°C)' },
    { id: 4, time: '15:20:00', type: 'ALERT', msg: 'Modbus Gateway Node C has disconnected (Offline)' }
  ]);
  const [uptimeCounter, setUptimeCounter] = useState(99.987);

  const emptyForm = { 
    name: '', price: '', stock: '', category: '', image: '', description: '',
    shipping: { reguler: true, instan: true, kargo: true },
    services: { instalasi: true, konsultasi: true, garansi: true },
    protocol: 'LoRaWAN',
    status: 'Online'
  };
  const [formData, setFormData] = useState(emptyForm);

  // Fetch Products
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

  // Fetch Order History
  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    }, (error) => {
      console.error("Order history fetch error:", error);
    });
    return () => unsubscribe();
  }, []);

  // QRIS Timer
  useEffect(() => {
    let timer;
    if (isQRISModalOpen && qrisTimer > 0) {
      timer = setInterval(() => {
        setQrisTimer(prev => prev - 1);
      }, 1000);
    } else if (qrisTimer === 0) {
      setIsQRISModalOpen(false);
      toast.error('Waktu pembayaran QRIS habis. Silakan coba lagi.');
    }
    return () => clearInterval(timer);
  }, [isQRISModalOpen, qrisTimer]);

  // Live Dashboard Telemetry Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Rotate telemetry data
      setSimulatedChartData(prev => [...prev.slice(1), Math.floor(Math.random() * 50) + 40]);
      
      // Update simulated live stats
      setUptimeCounter(prev => +(prev + (Math.random() * 0.0002 - 0.0001)).toFixed(5));

      // Randomly append logs
      if (Math.random() > 0.7) {
        const timeStr = new Date().toLocaleTimeString('id-ID');
        const warningTypes = ['INFO', 'WARNING', 'CRITICAL', 'ALERT'];
        const chosenType = warningTypes[Math.floor(Math.random() * warningTypes.length)];
        const alerts = {
          'INFO': 'Telemetry packet successfully pushed to Azure Cloud Broker.',
          'WARNING': `Low signal warning detected at Remote Sensor Node ${Math.floor(Math.random() * 5 + 1)}.`,
          'CRITICAL': `High vibration alert threshold breached on Motor Node ${Math.floor(Math.random() * 3 + 1)}.`,
          'ALERT': `Ping timeout occurred at Main LoRa Gateway ${Math.floor(Math.random() * 2 + 1)}.`
        };
        setSimulatedLogs(prev => [
          { id: Date.now(), time: timeStr, type: chosenType, msg: alerts[chosenType] },
          ...prev.slice(0, 5)
        ]);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['Semua', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    
    // Search
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    // Category
    if (filterCategory !== 'Semua') {
      result = result.filter(p => p.category === filterCategory);
    }
    // Protocol
    if (filterProtocol !== 'Semua') {
      result = result.filter(p => p.protocol === filterProtocol);
    }
    // Status
    if (filterStatus !== 'Semua') {
      result = result.filter(p => p.status === filterStatus);
    }
    // Sort
    if (filterSort === 'Terbaru') {
      // simple sort by timestamp or id as mock
      result = [...result].sort((a, b) => b.id.localeCompare(a.id));
    } else if (filterSort === 'Populer') {
      result = [...result].sort((a, b) => (b.stock || 0) - (a.stock || 0));
    }
    
    return result;
  }, [products, search, filterCategory, filterProtocol, filterStatus, filterSort]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Auth Handlers completely bypassed

  // Contact Us Submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error('Lengkapi semua data telemetri formulir!');
      return;
    }
    setIsSubmittingMessage(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        userId: currentUser ? currentUser.uid : 'guest',
        timestamp: new Date().toISOString()
      });
      toast.success('Log pengaduan berhasil diunggah ke cloud!');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunggah pesan. Periksa jaringan.');
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  // Product Add / Edit Handlers
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File maksimal 5MB.');
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

  const requestEditProduct = (product, e) => {
    e.stopPropagation();
    setFormData({ 
      name: product.name || '', 
      price: product.price ? String(product.price) : '', 
      stock: product.stock ? String(product.stock) : '', 
      category: product.category || '', 
      image: product.image || '', 
      description: product.description || '',
      shipping: product.shipping || { reguler: true, instan: true, kargo: true },
      services: product.services || { instalasi: true, konsultasi: true, garansi: true },
      protocol: product.protocol || 'LoRaWAN',
      status: product.status || 'Online'
    });
    setEditingId(product.id);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const { name, price, stock, category, image, description, shipping, services, protocol, status } = formData;
    if (!name || !price || !stock || !category) return toast.error('Mohon lengkapi data!');
    
    try {
      const productData = {
        name, 
        price: Number(price), 
        stock: Number(stock), 
        category, 
        description: description || '',
        image: image || '',
        shipping,
        services,
        protocol: protocol || 'LoRaWAN',
        status: status || 'Online'
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        toast.success('Spesifikasi device berhasil diupdate.');
      } else {
        await addDoc(collection(db, "products"), productData);
        toast.success('Device baru berhasil didaftarkan.');
      }

      setIsAddModalOpen(false);
      setEditingId(null);
      setFormData(emptyForm);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mendaftarkan device.');
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return toast.error('Stok perangkat sedang kosong.');
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('Batas limit stok tercapai.');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success('Ditambahkan ke keranjang belanja');
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

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} disalin ke clipboard!`);
  };

  const requestRemoveFromCart = (id) => {
    setConfirmModal({ isOpen: true, type: 'cart', id });
  };

   const requestCheckout = () => {
    if (cart.length === 0) return;
    setConfirmModal({ isOpen: true, type: 'checkout', id: null });
  };

  const processCheckout = async () => {
    try {
      const batch = writeBatch(db);
      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        const originalProduct = products.find(p => p.id === item.id);
        if (originalProduct) {
          batch.update(productRef, { stock: originalProduct.stock - item.quantity });
        }
      }
      
      const shippingCost = selectedCourier === 'JNE' ? 50000 : selectedCourier === 'J&T' ? 150000 : selectedCourier === 'Indah' ? 350000 : 0;
      const finalTotal = total + shippingCost;

      // Save order to history
      await addDoc(collection(db, 'orders'), {
        userId: currentUser ? currentUser.uid : 'guest',
        userEmail: currentUser ? currentUser.email : 'Guest',
        customerName: customerName || 'Pelanggan Umum',
        recipientPhone: recipientPhone || '',
        recipientAddress: recipientAddress || '',
        selectedCourier: selectedCourier,
        shippingCost,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || ''
        })),
        total: finalTotal,
        paymentMethod,
        status: 'Selesai',
        timestamp: new Date().toISOString()
      });

      await batch.commit();
      
      toast.success(`Pembelian & Pembayaran ${paymentMethod} sukses!`);
      setCart([]);
      setCustomerName('');
      setRecipientPhone('');
      setRecipientAddress('');
      setIsCartOpen(false);
      setIsQRISModalOpen(false);
      setConfirmModal({ isOpen: false, type: null, id: null });
    } catch (error) {
      console.error(error);
      toast.error('Gagal memproses checkout.');
    }
  };

  const handleConfirmAction = async () => {
    if (confirmModal.type === 'product') {
      try {
        await deleteDoc(doc(db, "products", confirmModal.id));
        toast.success('Device dihapus dari katalog.');
      } catch (error) {
        toast.error('Gagal menghapus device.');
      }
    } else if (confirmModal.type === 'cart') {
      setCart(prev => prev.filter(i => i.id !== confirmModal.id));
      toast.success('Dihapus dari keranjang.');
    } else if (confirmModal.type === 'checkout') {
      if (!customerName || !recipientPhone || !recipientAddress) {
        toast.error('Lengkapi semua data informasi pengiriman!');
        return;
      }
      if (paymentMethod === 'QRIS') {
        setConfirmModal({ isOpen: false, type: null, id: null });
        setQrisTimer(300);
        setIsQRISModalOpen(true);
      } else {
        await processCheckout();
      }
    }
    if (confirmModal.type !== 'checkout' || paymentMethod !== 'QRIS') {
      setConfirmModal({ isOpen: false, type: null, id: null });
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = selectedCourier === 'JNE' ? 50000 : selectedCourier === 'J&T' ? 150000 : selectedCourier === 'Indah' ? 350000 : 0;
  const finalTotal = total + shippingCost;

  return (
    <div className="flex flex-col h-screen bg-[#030306] bg-grid-cyber font-sans text-[#f4f4f5] overflow-hidden relative">
      <Toaster position="top-center" toastOptions={{ className: 'font-semibold glass-dark text-white border-emerald-500/20 shadow-2xl' }} />
      
      {/* FUTURISTIC NEON GLOW EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* TOP GLOWING NAVBAR HEADER */}
      <header className="h-20 bg-[#09090b]/80 backdrop-blur-2xl border-b border-[#1f1f2e]/60 flex items-center justify-between px-4 sm:px-8 z-30 shrink-0 sticky top-0">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => { setActiveTab('home'); setSearch(''); }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Sprout className="w-5 h-5 font-bold" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-wider text-white">
            Smart<span className="text-emerald-500 text-glow-emerald"> Farming</span>
          </span>
        </div>

        {/* Center: Desktop Navigation Menus */}
        <nav className="hidden md:flex items-center gap-1 xl:gap-2 mx-4">
          <button 
            onClick={() => { setActiveTab('home'); }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${activeTab === 'home' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            Marketplace
          </button>
          
          <button 
            onClick={() => { setActiveTab('dashboard'); }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <Activity className="w-3.5 h-3.5" />
            Dashboard Live
          </button>
          
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${activeTab === 'history' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <History className="w-3.5 h-3.5" />
            Riwayat Pembelian
          </button>
          
          <button 
            onClick={() => setActiveTab('contact')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${activeTab === 'contact' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <Phone className="w-3.5 h-3.5" />
            Hubungi Kami
          </button>
        </nav>

        {/* Right Side: Search (optional), Register Device, Cart, User Profile display */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {activeTab === 'home' && (
            <div className="relative hidden md:flex items-center w-40 xl:w-56">
              <Search className="absolute left-3.5 w-3.5 h-3.5 text-emerald-400" />
              <input 
                type="text" 
                placeholder="Cari device..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-full py-1.5 pl-9 pr-3 text-xs font-semibold text-white placeholder-[#52525b] outline-none transition-all duration-300"
              />
            </div>
          )}

          {activeTab === 'home' && (
            <button 
              onClick={() => {
                setEditingId(null);
                setFormData(emptyForm);
                setIsAddModalOpen(true);
              }} 
              className="hidden md:flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-full font-bold text-xs tracking-wider transition-all duration-300 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 font-bold" /> 
              DAFTARKAN DEVICE
            </button>
          )}

          {/* Cart Trigger */}
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative p-2.5 bg-[#0a0a0f] border border-[#1f1f2e] hover:border-emerald-500/50 text-white rounded-full transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#030306]">
                {cartItemCount}
              </span>
            )}
          </button>


        </div>
      </header>

      {/* WORKSPACE CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden pb-16 md:pb-0 z-10">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 hide-scrollbar">
          
          {/* TAB 1: FUTURISTIC HOME / MARKETPLACE */}
          {activeTab === 'home' && (
            <div className="max-w-7xl mx-auto space-y-12">
              
              {/* HERO FULLSCREEN PREMIUM */}
              <div className="relative rounded-3xl p-6 sm:p-12 border border-[#1f1f2e] bg-[#06060a]/90 overflow-hidden shadow-2xl flex flex-col justify-center items-center text-center">
                
                {/* Node Connected Graphic Animation Background */}
                <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse-slow"></div>

                {/* Animated Pulsing Sensor Rings */}
                <div className="w-16 h-16 rounded-full border border-emerald-500/25 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping"></div>
                  <Cpu className="w-7 h-7 text-emerald-400 animate-pulse" />
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white mb-4 leading-tight">
                  Next Generation <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent text-glow-emerald">IoT Marketplace</span>
                </h1>
                
                <p className="text-sm sm:text-lg text-[#a1a1aa] max-w-2xl mb-8 font-medium">
                  Beli, hubungkan, dan monitor perangkat IoT dalam satu ekosistem cerdas terintegrasi berstandar industri.
                </p>

                <div className="flex flex-wrap gap-4 justify-center mb-12">
                  <button onClick={() => {
                    const el = document.getElementById('catalog-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs tracking-wider rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/10 cursor-pointer">
                    EXPLORE MARKETPLACE
                  </button>
                  <button onClick={() => setActiveTab('dashboard')} className="px-6 py-3.5 bg-[#0a0a0f] border border-[#1f1f2e] hover:border-emerald-500/50 text-[#a1a1aa] hover:text-white font-extrabold text-xs tracking-wider rounded-xl transition-all duration-300 cursor-pointer">
                    CONNECT DEVICE
                  </button>
                </div>

                {/* Real-time stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl border-t border-[#1f1f2e]/60 pt-8">
                  <div className="text-center p-3">
                    <span className="block text-2xl sm:text-3xl font-display font-black text-white text-glow-emerald">5,000+</span>
                    <span className="text-[10px] sm:text-xs text-[#71717a] font-bold uppercase tracking-wider mt-1 block">Connected Devices</span>
                  </div>
                  <div className="text-center p-3">
                    <span className="block text-2xl sm:text-3xl font-display font-black text-emerald-400 text-glow-emerald">120K+</span>
                    <span className="text-[10px] sm:text-xs text-[#71717a] font-bold uppercase tracking-wider mt-1 block">Active Sensors</span>
                  </div>
                  <div className="text-center p-3">
                    <span className="block text-2xl sm:text-3xl font-display font-black text-white text-glow-cyan">{uptimeCounter}%</span>
                    <span className="text-[10px] sm:text-xs text-[#71717a] font-bold uppercase tracking-wider mt-1 block">Uptime Realtime</span>
                  </div>
                  <div className="text-center p-3">
                    <span className="block text-2xl sm:text-3xl font-display font-black text-cyan-400 text-glow-cyan">240+</span>
                    <span className="text-[10px] sm:text-xs text-[#71717a] font-bold uppercase tracking-wider mt-1 block">Smart Cities</span>
                  </div>
                </div>

              </div>

              {/* MARKETPLACE SECTION WITH INTEGRATED SIDEBAR FILTER */}
              <div id="catalog-grid" className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
                
                {/* Left filter sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-[#06060a] border border-[#1f1f2e] rounded-2xl p-5 space-y-6 sticky top-6">
                    <div className="flex items-center gap-2 border-b border-[#1f1f2e]/60 pb-3">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-black tracking-wider uppercase text-white">Filter Perangkat</h3>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#52525b] uppercase tracking-wider block">Kategori</label>
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterCategory === cat ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-[#0a0a0f] text-[#71717a] border border-[#1f1f2e] hover:border-[#27272a] hover:text-white'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Protocol Filter */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#52525b] uppercase tracking-wider block">Protokol Jaringan</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Semua', 'LoRaWAN', 'Wi-Fi', 'Zigbee', 'NB-IoT'].map(proto => (
                          <button
                            key={proto}
                            onClick={() => setFilterProtocol(proto)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterProtocol === proto ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-[#0a0a0f] text-[#71717a] border border-[#1f1f2e] hover:border-[#27272a] hover:text-white'}`}
                          >
                            {proto}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#52525b] uppercase tracking-wider block">Status Koneksi</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Semua', 'Online', 'Offline'].map(stat => (
                          <button
                            key={stat}
                            onClick={() => setFilterStatus(stat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === stat ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-[#0a0a0f] text-[#71717a] border border-[#1f1f2e] hover:border-[#27272a] hover:text-white'}`}
                          >
                            {stat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort Filter */}
                    <div className="space-y-2 border-t border-[#1f1f2e]/60 pt-4">
                      <label className="text-[10px] font-black text-[#52525b] uppercase tracking-wider block">Urutan</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Terbaru', 'Populer'].map(sortOpt => (
                          <button
                            key={sortOpt}
                            onClick={() => setFilterSort(sortOpt)}
                            className={`py-2 rounded-lg text-xs font-bold transition-all ${filterSort === sortOpt ? 'bg-emerald-500 text-black' : 'bg-[#0a0a0f] text-[#71717a] border border-[#1f1f2e] hover:text-white'}`}
                          >
                            {sortOpt}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right side product grid or empty state */}
                <div className="lg:col-span-3">
                  {filteredProducts.length === 0 ? (
                    
                    /* PREMIUM EMPTY STATE CARD - AS REQUESTED */
                    <div className="bg-[#06060a] rounded-3xl p-12 text-center border border-[#1f1f2e] shadow-xl flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-emerald-500/3 rounded-full blur-[60px] pointer-events-none animate-pulse-slow"></div>
                      
                      {/* Interactive holographic style icon */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 relative animate-float shadow-inner">
                        <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ping"></div>
                        <Cpu className="w-10 h-10 text-emerald-400" />
                      </div>

                      <h3 className="text-xl font-display font-extrabold text-white mb-2">Belum ada perangkat tersedia</h3>
                      <p className="text-sm text-[#71717a] max-w-sm mb-6 leading-relaxed">
                        Perangkat yang ditambahkan admin akan muncul di sini. Aktifkan broker cloud dan sambungkan hardware Anda.
                      </p>

                      <button 
                        onClick={() => {
                          setEditingId(null);
                          setFormData(emptyForm);
                          setIsAddModalOpen(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4 font-black" /> TAMBAH DEVICE
                      </button>

                    </div>
                  ) : (
                    
                    /* GORGEOUS FUTURISTIC PRODUCT GRID */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProducts.map(product => (
                        <div 
                          key={product.id} 
                          onClick={() => setDetailModalProduct(product)} 
                          className="bg-[#06060a] rounded-3xl p-4 border border-[#1f1f2e] hover:border-emerald-500/40 shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.08)] transition-all duration-300 group relative flex flex-col cursor-pointer"
                        >
                          {/* Pulsing Status dot indicator */}
                          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 border border-[#1f1f2e] backdrop-blur-md">
                            <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'Offline' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                            <span className="text-[9px] font-bold tracking-wider uppercase text-white">{product.status || 'Online'}</span>
                          </div>

                          {/* Network Protocol indicator */}
                          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md">
                            <Radio className="w-2.5 h-2.5 text-cyan-400" />
                            <span className="text-[9px] font-black tracking-wider text-cyan-400 uppercase">{product.protocol || 'LoRaWAN'}</span>
                          </div>

                          {/* Image */}
                          <div className="aspect-video w-full rounded-2xl bg-black/40 border border-[#1f1f2e]/60 overflow-hidden relative mb-4 shrink-0 flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="text-[#3f3f46] flex flex-col items-center gap-2">
                                <Cpu className="w-8 h-8" />
                                <span className="text-[9px] font-bold tracking-widest text-[#71717a]">INTELLIGENT NODE</span>
                              </div>
                            )}
                          </div>

                          {/* Product details */}
                          <div className="flex-1 flex flex-col">
                            <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase mb-1">{product.category}</span>
                            
                            <h3 className="font-display font-bold text-white text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-emerald-400 transition-colors">
                              {product.name}
                            </h3>
                            
                            {product.description && (
                              <p className="text-xs text-[#71717a] line-clamp-2 mt-1 mb-4 leading-relaxed font-medium">
                                {product.description}
                              </p>
                            )}

                            {/* Price / Action Row */}
                            <div className="mt-auto pt-3 border-t border-[#1f1f2e]/40 flex items-center justify-between">
                              <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-[#52525b] uppercase tracking-wider block">Biaya Deploy</span>
                                <span className="font-display font-black text-white text-base sm:text-lg">
                                  {formatRupiah(product.price)}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toast.success('Disimpan ke Node Wishlist!'); }}
                                  className="w-9 h-9 rounded-xl bg-white/5 text-[#a1a1aa] hover:bg-emerald-500/10 hover:text-emerald-400 border border-[#1f1f2e] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                  title="Wishlist"
                                >
                                  <Heart className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(product.id);
                                    setFormData({
                                      name: product.name,
                                      price: product.price.toString(),
                                      stock: product.stock.toString(),
                                      category: product.category,
                                      image: product.image || '',
                                      description: product.description || '',
                                      protocol: product.protocol || 'LoRaWAN',
                                      status: product.status || 'Online',
                                      shipping: product.shipping || { instan: true, kargo: true },
                                      services: product.services || { instalasi: true, konsultasi: true, garansi: true }
                                    });
                                    setIsAddModalOpen(true);
                                  }}
                                  className="w-9 h-9 rounded-xl bg-white/5 text-[#a1a1aa] hover:bg-emerald-500/10 hover:text-emerald-400 border border-[#1f1f2e] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                  title="Edit Device"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmModal({ isOpen: true, type: 'product', id: product.id });
                                  }}
                                  className="w-9 h-9 rounded-xl bg-white/5 text-[#a1a1aa] hover:bg-red-500/10 hover:text-red-500 border border-[#1f1f2e] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                  title="Hapus Device"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                  disabled={product.stock <= 0}
                                  className="w-9 h-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:bg-[#1f1f2e] disabled:text-[#52525b] disabled:cursor-not-allowed shrink-0 cursor-pointer"
                                >
                                  <Plus className="w-4 h-4 font-black" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: COGNITIVE MONITORING DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-8 pb-10">
              
              {/* TOP DASHBOARD ANALYTICS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Uptime Stat */}
                <div className="bg-[#06060a] border border-[#1f1f2e] rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/3 rounded-full blur-[30px] pointer-events-none"></div>
                  <div className="flex items-center justify-between text-[#71717a]">
                    <span className="text-[10px] font-black uppercase tracking-wider">Network Health Uptime</span>
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-black text-white">{uptimeCounter}%</h3>
                    <span className="text-[10px] text-[#52525b] font-medium block">All regional gateways combined</span>
                  </div>
                  <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: '99.9%' }}></div>
                  </div>
                </div>

                {/* Packet Delivery Rate */}
                <div className="bg-[#06060a] border border-[#1f1f2e] rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/3 rounded-full blur-[30px] pointer-events-none"></div>
                  <div className="flex items-center justify-between text-[#71717a]">
                    <span className="text-[10px] font-black uppercase tracking-wider">Packet Delivery Rate</span>
                    <Signal className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-black text-white">99.84%</h3>
                    <span className="text-[10px] text-[#52525b] font-medium block">Payload verification checked</span>
                  </div>
                  <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: '98%' }}></div>
                  </div>
                </div>

                {/* Battery Status */}
                <div className="bg-[#06060a] border border-[#1f1f2e] rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/3 rounded-full blur-[30px] pointer-events-none"></div>
                  <div className="flex items-center justify-between text-[#71717a]">
                    <span className="text-[10px] font-black uppercase tracking-wider">Battery Alert Nodes</span>
                    <Battery className="w-4 h-4 text-red-500 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-black text-white">1 Node Low</h3>
                    <span className="text-[10px] text-[#52525b] font-medium block">Requires service deployment</span>
                  </div>
                  <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full transition-all duration-300" style={{ width: '15%' }}></div>
                  </div>
                </div>

                {/* Gateway Latency */}
                <div className="bg-[#06060a] border border-[#1f1f2e] rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/3 rounded-full blur-[30px] pointer-events-none"></div>
                  <div className="flex items-center justify-between text-[#71717a]">
                    <span className="text-[10px] font-black uppercase tracking-wider">Broker MQTT Latency</span>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-black text-white">14.5 ms</h3>
                    <span className="text-[10px] text-[#52525b] font-medium block">Pushed via edge websockets</span>
                  </div>
                  <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: '90%' }}></div>
                  </div>
                </div>

              </div>

              {/* REALTIME SENSOR CHART & LIVE LOGS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG-based dynamic updating telemetry chart */}
                <div className="lg:col-span-2 bg-[#06060a] border border-[#1f1f2e] rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">MQTT Stream Telemetry Chart (Live)</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-[#18181b] border border-[#27272a] text-emerald-400 px-3 py-1 rounded-full uppercase">Realtime</span>
                  </div>

                  <div className="h-64 w-full bg-[#030306] rounded-2xl relative border border-[#1f1f2e] p-4 overflow-hidden flex items-end">
                    
                    {/* SVG Line Graph */}
                    <svg className="absolute inset-0 w-full h-full p-2" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Area Path */}
                      <path 
                        d={`M 0 100 ${simulatedChartData.map((val, idx) => `L ${(idx / (simulatedChartData.length - 1)) * 100} ${100 - val}`).join(' ')} L 100 100 Z`} 
                        fill="url(#chartGrad)"
                        className="transition-all duration-500"
                      />
                      
                      {/* Line Path */}
                      <path 
                        d={simulatedChartData.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${(idx / (simulatedChartData.length - 1)) * 100} ${100 - val}`).join(' ')} 
                        fill="none" 
                        stroke="#10B981" 
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>

                    {/* Chart helper background grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-10">
                      <div className="border-b border-[#27272a] w-full"></div>
                      <div className="border-b border-[#27272a] w-full"></div>
                      <div className="border-b border-[#27272a] w-full"></div>
                      <div className="border-b border-[#27272a] w-full"></div>
                    </div>

                    <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#52525b] uppercase">MQTT broker telemetry broker</div>
                  </div>
                </div>

                {/* Live Activity logs panel */}
                <div className="lg:col-span-1 bg-[#06060a] border border-[#1f1f2e] rounded-3xl p-6 space-y-4 flex flex-col h-full max-h-[350px] lg:max-h-none overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-[#1f1f2e]/60 pb-3 shrink-0">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-black tracking-wider uppercase text-white">Live Notification Broker Log</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 hide-scrollbar">
                    {simulatedLogs.map(log => (
                      <div key={log.id} className="bg-black/40 border border-[#1f1f2e] p-3 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded ${
                            log.type === 'INFO' ? 'bg-[#18181b] text-cyan-400' :
                            log.type === 'WARNING' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>{log.type}</span>
                          <span className="text-[9px] text-[#52525b] font-mono">{log.time}</span>
                        </div>
                        <p className="text-[#a1a1aa] font-medium text-[11px] leading-relaxed break-words">{log.msg}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* SENSOR MONITORING & ABSRACT DEVICE MAP GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Node Status Table */}
                <div className="lg:col-span-2 bg-[#06060a] border border-[#1f1f2e] rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1f1f2e]/60 pb-3">
                    <h3 className="text-xs font-black tracking-wider uppercase text-white">Sensor Monitoring Status</h3>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[#52525b] border-b border-[#1f1f2e]/60 text-[10px] uppercase font-bold">
                          <th className="py-2.5">Device Node</th>
                          <th className="py-2.5">Kategori</th>
                          <th className="py-2.5">Protokol</th>
                          <th className="py-2.5">Battery</th>
                          <th className="py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f1f2e]/40 font-medium text-[#a1a1aa]">
                        <tr className="hover:bg-white/2 transition-colors">
                          <td className="py-3 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Node A - Main Warehouse
                          </td>
                          <td className="py-3">Temperature</td>
                          <td className="py-3 text-cyan-400">LoRaWAN</td>
                          <td className="py-3 text-emerald-400 font-bold">94%</td>
                          <td className="py-3 text-right text-emerald-500 font-bold">Active</td>
                        </tr>
                        <tr className="hover:bg-white/2 transition-colors">
                          <td className="py-3 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Node B - Cold Storage
                          </td>
                          <td className="py-3">Humidity</td>
                          <td className="py-3 text-cyan-400">NB-IoT</td>
                          <td className="py-3 text-yellow-500 font-bold">12%</td>
                          <td className="py-3 text-right text-emerald-500 font-bold">Active</td>
                        </tr>
                        <tr className="hover:bg-white/2 transition-colors">
                          <td className="py-3 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Node C - Server Room
                          </td>
                          <td className="py-3">Power Modbus</td>
                          <td className="py-3 text-cyan-400">Zigbee</td>
                          <td className="py-3 text-[#52525b] font-bold">0%</td>
                          <td className="py-3 text-right text-red-500 font-bold">Offline</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Abstract simulated map node chart */}
                <div className="lg:col-span-1 bg-[#06060a] border border-[#1f1f2e] rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#1f1f2e]/60 pb-3">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black tracking-wider uppercase text-white">Live Node Location Blueprint</h3>
                  </div>

                  <div className="h-48 bg-[#030306] rounded-2xl border border-[#1f1f2e] relative overflow-hidden flex items-center justify-center p-4">
                    {/* Simulated vector points layout */}
                    <div className="absolute w-[80%] h-[80%] border border-[#1f1f2e] rounded-full flex items-center justify-center opacity-30">
                      <div className="w-[50%] h-[50%] border border-[#1f1f2e] rounded-full"></div>
                    </div>
                    
                    {/* Pulsing mapped nodes */}
                    <div className="absolute top-[25%] left-[30%] w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>
                    <div className="absolute bottom-[35%] right-[25%] w-3.5 h-3.5 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    </div>
                    <div className="absolute top-[40%] right-[35%] w-3 h-3 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-red-400"></span>
                    </div>
                    <div className="absolute bottom-[20%] left-[20%] w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500"></div>

                    <div className="absolute top-2 left-2 text-[8px] font-mono text-[#52525b] uppercase">Local Area Coordinates Grid</div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: ORDER HISTORY / DEPLOYMENT LOGS */}
          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto pb-10">
              {orders.length === 0 ? (
                <div className="bg-[#06060a] rounded-3xl p-12 text-center border border-[#1f1f2e] shadow-xl flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-[#0a0a0f] text-[#3f3f46] border border-[#1f1f2e] rounded-full flex items-center justify-center mb-6">
                    <History className="w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-display font-extrabold text-white mb-2">Belum ada deployment</h2>
                  <p className="text-sm text-[#71717a] max-w-md mb-6 leading-relaxed">
                    Anda belum melakukan deployment hardware apapun. Cari modul sensor cerdas dan lakukan integrasi awal.
                  </p>
                  <button onClick={() => setActiveTab('home')} className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/10 cursor-pointer">
                    Mulai Belanja IoT
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order.id} className="bg-[#06060a] rounded-3xl p-6 border border-[#1f1f2e] shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f1f2e]/60 pb-4 mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#52525b] tracking-wider uppercase">GATEWAY ID:</span>
                            <span className="text-xs font-black text-emerald-400 font-mono">{order.id}</span>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(order.id); toast.success('ID pesanan disalin!'); }} 
                              className="text-[#71717a] hover:text-white p-0.5 rounded transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#a1a1aa] font-semibold">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            {new Date(order.timestamp).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                          </div>
                          {order.customerName && (
                            <div className="text-[10px] text-cyan-400 font-black bg-cyan-500/10 px-2.5 py-0.5 rounded-md w-max border border-cyan-500/20 mt-1 uppercase tracking-wide">
                              Pelanggan: {order.customerName}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-emerald-500/25 uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                          </span>
                          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 font-bold rounded-lg text-xs border border-cyan-500/25 uppercase font-mono tracking-wider">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered List */}
                      <div className="space-y-3 mb-4">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center bg-black/40 p-3 rounded-2xl border border-[#1f1f2e]/60">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-[#1f1f2e]/60 bg-white" />
                            ) : (
                              <div className="w-12 h-12 bg-[#06060a] rounded-xl flex items-center justify-center text-[#3f3f46] border border-[#1f1f2e]/60"><ImageIcon className="w-6 h-6" /></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                              <p className="text-xs text-[#71717a] font-bold">{item.quantity} x {formatRupiah(item.price)}</p>
                            </div>
                            <div className="font-black text-white text-sm shrink-0">
                              {formatRupiah(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1f1f2e]/60">
                        <span className="text-xs text-[#52525b] font-black uppercase tracking-wider">Total Biaya Deploy</span>
                        <span className="text-lg font-black text-emerald-400 text-glow-emerald">{formatRupiah(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONTACT US / SUPPORT */}
          {activeTab === 'contact' && (
            <div className="max-w-6xl mx-auto pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side Info cards */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* WhatsApp */}
                  <a 
                    href="https://wa.me/6285235078392" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 rounded-3xl p-6 border border-emerald-500/20 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 group-hover:scale-115 transition-transform duration-300">
                      <Phone className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white mb-1">WhatsApp Customer Service</h3>
                    <p className="text-xs text-[#a1a1aa] mb-4">Chat tim support hardware & gateway kami via WhatsApp.</p>
                    <div className="flex items-center justify-between font-black text-emerald-400 text-lg">
                      <span>085235078392</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>

                  {/* Email */}
                  <a 
                    href="mailto:rm4951895@gmail.com" 
                    className="block bg-gradient-to-br from-cyan-500/5 to-cyan-500/0 rounded-3xl p-6 border border-cyan-500/20 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-black flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 group-hover:scale-115 transition-transform duration-300">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white mb-1">Email Smart Farming</h3>
                    <p className="text-xs text-[#a1a1aa] mb-4">Kirim penawaran sistem integrasi smart farming enterprise.</p>
                    <div className="flex items-center justify-between font-black text-cyan-400 text-base sm:text-lg break-all">
                      <span>rm4951895@gmail.com</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                  </a>

                  {/* Address */}
                  <div className="bg-[#06060a] rounded-3xl p-6 border border-[#1f1f2e] shadow-sm">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Box className="w-5 h-5 text-emerald-400" />
                      Smart Farming Headquarters
                    </h4>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">
                      Pusat R&D Telemetri & Smart Farming Enterprise.<br/>
                      Gedung Pusat Inovasi Digital Lantai 8,<br/>
                      Kecamatan Blimbing, Kota Malang, Jawa Timur.
                    </p>
                  </div>

                </div>

                {/* Right Side form */}
                <div className="lg:col-span-2 bg-[#06060a] rounded-3xl p-6 sm:p-8 border border-[#1f1f2e] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/3 rounded-full blur-[40px] pointer-events-none"></div>
                  
                  <h3 className="text-lg font-display font-extrabold text-white mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    Log Pengaduan & Kontak Gateway
                  </h3>
                  <p className="text-xs text-[#a1a1aa] mb-6 leading-relaxed">Ada kendala perihal integrasi sensor, registrasi cloud, atau butuh integrasi custom? Kirimkan log laporan di bawah.</p>

                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-2">Nama Lengkap Operator</label>
                      <input 
                        required 
                        type="text" 
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl p-3.5 text-white font-medium text-xs placeholder-[#52525b] outline-none transition-all duration-300" 
                        placeholder="Contoh: Budi Santoso (Eng. Lead)" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-2">Alamat Email Broker</label>
                      <input 
                        required 
                        type="email" 
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl p-3.5 text-white font-medium text-xs placeholder-[#52525b] outline-none transition-all duration-300" 
                        placeholder="Contoh: operator@smartcity.id" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-2">Isi Log Laporan / Rincian Custom</label>
                      <textarea 
                        required 
                        rows="4" 
                        value={contactMessage}
                        onChange={e => setContactMessage(e.target.value)}
                        className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl p-3.5 text-white font-medium text-xs placeholder-[#52525b] outline-none transition-all duration-300" 
                        placeholder="Jelaskan spesifikasi kebutuhan sensor, batasan frekuensi, dll..."
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmittingMessage}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#1f1f2e] text-black font-extrabold text-xs tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingMessage ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 font-black" />
                          UNGGAH LOG PENGADUAN
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: AUTHENTICATION PANEL BYPASSED */}

          {/* GLOBAL FUTURISTIC ENTERPRISE FOOTER */}
          <footer className="mt-20 border-t border-[#1f1f2e]/60 bg-[#06060a]/80 backdrop-blur-2xl rounded-t-3xl pt-16 pb-24 sm:pb-16 px-6 sm:px-12 relative z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              
              {/* Brand Info Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <Sprout className="w-5 h-5 font-bold" />
                  </div>
                  <span className="font-display font-extrabold text-lg tracking-wider text-white">
                    Smart<span className="text-emerald-500"> Farming</span>
                  </span>
                </div>
                <p className="text-xs text-[#71717a] font-medium leading-relaxed">
                  Menghadirkan revolusi teknologi pertanian modern berbasis IoT dan kecerdasan buatan. Paduan otomatisasi presisi dan pemantauan sensor real-time untuk pertanian masa depan.
                </p>                <div className="flex gap-2.5 pt-2">
                  <a href="#" className="w-9 h-9 rounded-lg bg-black/40 border border-[#1f1f2e] hover:border-emerald-500/50 hover:bg-emerald-500/5 flex items-center justify-center text-[#71717a] hover:text-emerald-400 transition-all duration-300">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-9 h-9 rounded-lg bg-black/40 border border-[#1f1f2e] hover:border-emerald-500/50 hover:bg-emerald-500/5 flex items-center justify-center text-[#71717a] hover:text-emerald-400 transition-all duration-300">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-9 h-9 rounded-lg bg-black/40 border border-[#1f1f2e] hover:border-emerald-500/50 hover:bg-emerald-500/5 flex items-center justify-center text-[#71717a] hover:text-emerald-400 transition-all duration-300">
                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="#" className="w-9 h-9 rounded-lg bg-black/40 border border-[#1f1f2e] hover:border-emerald-500/50 hover:bg-emerald-500/5 flex items-center justify-center text-[#71717a] hover:text-emerald-400 transition-all duration-300">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Products and Innovations Column */}
              <div className="space-y-4 col-span-1">
                <div className="relative pb-2">
                  <h4 className="text-xs font-bold text-white tracking-wider uppercase">Produk & Inovasi</h4>
                  <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-emerald-400"></div>
                </div>
                <ul className="space-y-3 text-xs text-[#71717a] font-semibold">
                  <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors cursor-pointer">
                    <span className="text-[8px] text-emerald-400">○</span> Sistem Irigasi Pintar
                  </li>
                  <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors cursor-pointer">
                    <span className="text-[8px] text-emerald-400">○</span> Sensor NPK & pH Tanah
                  </li>
                  <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors cursor-pointer">
                    <span className="text-[8px] text-emerald-400">○</span> Drone Pemantau Hama
                  </li>
                  <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors cursor-pointer">
                    <span className="text-[8px] text-emerald-400">○</span> Stasiun Cuaca Mikro
                  </li>
                  <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors cursor-pointer">
                    <span className="text-[8px] text-emerald-400">○</span> Layanan Otomasi Drones
                  </li>
                </ul>
              </div>

              {/* Contact Information Column */}
              <div className="space-y-4 col-span-1">
                <div className="relative pb-2">
                  <h4 className="text-xs font-bold text-white tracking-wider uppercase">Hubungi Kami</h4>
                  <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-emerald-400"></div>
                </div>
                <ul className="space-y-4 text-xs text-[#71717a] font-semibold">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Semarang, Jawa Tengah, Indonesia.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <a href="https://wa.me/6285235078392" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">085235078392</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                    <a href="mailto:rm4951895@gmail.com" className="hover:text-emerald-400 transition-colors">rm4951895@gmail.com</a>
                  </li>
                </ul>
              </div>

              {/* Subscription Column */}
              <div className="space-y-4 col-span-1">
                <div className="relative pb-2">
                  <h4 className="text-xs font-bold text-white tracking-wider uppercase">Berlangganan</h4>
                  <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-emerald-400"></div>
                </div>
                <p className="text-xs text-[#71717a] font-semibold leading-relaxed">
                  Dapatkan info terkini terkait rilis Smart Farming 2026 dan jadwal pembaruan sistem broker.
                </p>
                <div className="space-y-2.5 pt-1">
                  <input 
                    type="email" 
                    placeholder="Masukkan email Anda" 
                    className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl p-3 text-xs text-white placeholder-[#52525b] outline-none transition-all"
                  />
                  <button 
                    onClick={() => toast.success('Berhasil berlangganan!')}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/10 cursor-pointer text-center"
                  >
                    LANGGANAN SEKARANG
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Copyright Area */}
            <div className="max-w-7xl mx-auto mt-16 pt-6 border-t border-[#1f1f2e]/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-[#52525b]">
              <span>© 2026 Smart Farming. All rights reserved. Innovating Smart Agriculture Infrastructure.</span>
              <div className="flex gap-6">
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">Kebijakan Privasi</span>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">Syarat & Ketentuan</span>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV - GLASSMORPHIC */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#09090b]/80 backdrop-blur-2xl border-t border-[#1f1f2e]/60 flex justify-around items-center h-16 z-30 pb-safe">
        <button 
          onClick={() => { setActiveTab('home'); setFilterCategory('Semua'); setSearch(''); window.scrollTo(0,0); }} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'home' ? 'text-emerald-400' : 'text-[#71717a]'}`}
        >
          <Layers className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold tracking-wider">Katalog</span>
        </button>

        <button 
          onClick={() => { setActiveTab('dashboard'); }} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-[#71717a]'}`}
        >
          <Activity className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold tracking-wider">Live Map</span>
        </button>

        <button 
          onClick={() => {
            setActiveTab('history');
          }} 
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'history' ? 'text-emerald-400' : 'text-[#71717a]'}`}
        >
          <History className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold tracking-wider">Riwayat</span>
        </button>
      </nav>

      {/* RIGHT SIDEBAR CART (DEPLOYMENT TRAY) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[#030306]/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-[90%] sm:w-[420px] max-w-full bg-[#06060a] border-l border-[#1f1f2e] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 rounded-l-3xl overflow-hidden ml-auto">
            
            <div className="p-4 sm:p-6 border-b border-[#1f1f2e]/60 flex items-center justify-between bg-black/20 shrink-0">
              <h2 className="text-sm sm:text-base font-display font-extrabold text-white flex items-center gap-2 sm:gap-3 uppercase tracking-wider">
                <ShoppingBag className="w-5 h-5 text-emerald-400 animate-pulse" />
                Keranjang Belanja
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 bg-[#0a0a0f] border border-[#1f1f2e] rounded-full flex items-center justify-center text-[#71717a] hover:text-white shadow-sm transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 hide-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center text-[#52525b] mt-20 flex flex-col items-center justify-center space-y-3">
                  <ShoppingBag className="w-16 h-16 text-[#1f1f2e]" />
                  <p className="font-bold text-xs tracking-wider uppercase">Keranjang Belanja Kosong</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-black/30 p-3 sm:p-4 border border-[#1f1f2e] rounded-2xl flex gap-3 sm:gap-4 shadow-inner relative">
                    <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-black/40 border border-[#1f1f2e] shrink-0" />
                    
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1 leading-tight">{item.name}</h4>
                        <button onClick={() => requestRemoveFromCart(item.id)} className="text-[#52525b] hover:text-red-500 transition-colors shrink-0 p-1 -mt-1 -mr-1" title="Hapus dari Keranjang">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-emerald-400 font-display font-black text-xs sm:text-sm mt-1 mb-2">{formatRupiah(item.price)}</div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[8px] font-black text-[#52525b] uppercase tracking-wider">JUMLAH ITEM</span>
                        <div className="flex items-center bg-[#0a0a0f] rounded-lg border border-[#1f1f2e]">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-[#71717a] hover:text-white active:bg-white/5 rounded-l-lg transition-colors cursor-pointer">
                            <Minus className="w-3 h-3 font-bold" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-[#71717a] hover:text-white active:bg-white/5 rounded-r-lg transition-colors cursor-pointer">
                            <Plus className="w-3 h-3 font-bold" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 sm:p-6 bg-black/20 border-t border-[#1f1f2e]/60 shrink-0">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <span className="text-xs text-[#52525b] font-black uppercase tracking-wider">Total Harga</span>
                <span className="text-lg sm:text-xl font-display font-black text-emerald-400 text-glow-emerald">{formatRupiah(total)}</span>
              </div>
              <button 
                onClick={requestCheckout} 
                disabled={cart.length === 0} 
                className={`w-full py-3.5 rounded-xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${cart.length === 0 ? 'bg-[#1f1f2e] text-[#52525b] cursor-not-allowed border border-transparent' : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10'}`}
              >
                <CheckCircle2 className="w-4 h-4 font-black" /> BELI SEKARANG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRIS PAYMENT MODAL - CLOUD SYSTEM */}
      {isQRISModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030306]/75 backdrop-blur-sm" onClick={() => setIsQRISModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#06060a] border border-[#1f1f2e] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-[#1f1f2e]/60 flex justify-between items-center bg-[#06060a] shrink-0">
              <div className="flex items-center gap-2.5 text-left">
                <QrCode className="w-6 h-6 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="font-display font-extrabold text-white leading-none text-xs sm:text-sm">PEMBAYARAN QRIS TRANSAKSI</h3>
                  <span className="text-[9px] text-[#52525b] font-black tracking-wider uppercase block mt-1">BROKER CLOUD VERIFIED</span>
                </div>
              </div>
              <button onClick={() => setIsQRISModalOpen(false)} className="w-8 h-8 bg-[#0a0a0f] border border-[#1f1f2e] rounded-full flex items-center justify-center text-[#71717a] hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center text-center bg-black/10 hide-scrollbar space-y-6">
              <div className="bg-emerald-500/5 rounded-xl px-4 py-2 text-xs font-bold text-emerald-400 w-full flex items-center justify-center gap-2 border border-emerald-500/20 shrink-0">
                <Clock className="w-4 h-4 animate-spin text-emerald-400" />
                Selesaikan Pembayaran dalam: <span className="font-mono text-sm text-glow-emerald">{formatTimer(qrisTimer)}</span>
              </div>

              <div className="bg-white p-3 rounded-2xl shadow-inner relative group border border-emerald-500/25 max-h-[280px] max-w-[280px] overflow-hidden flex justify-center items-center shrink-0">
                <img 
                  src="/qris_merchant.png" 
                  alt="QRIS Merchant" 
                  className="max-h-[260px] w-auto object-contain rounded-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none">
                  <span className="text-[10px] font-black text-black px-3 py-1.5 bg-emerald-400 rounded-lg shadow-md border border-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black font-black" /> SCAN SECURE QRIS
                  </span>
                </div>
              </div>

              <div className="space-y-1 shrink-0 w-full">
                <span className="text-[8px] font-black text-[#52525b] uppercase tracking-wider block">TOTAL PEMBAYARAN</span>
                <h2 className="text-3xl font-display font-black text-emerald-400 text-glow-emerald">{formatRupiah(finalTotal)}</h2>
              </div>
            </div>

            <div className="p-6 border-t border-[#1f1f2e]/60 bg-[#06060a] shrink-0 space-y-3">
              <button 
                onClick={processCheckout}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 font-black" /> KONFIRMASI PEMBAYARAN SUDAH SCAN
              </button>
              <button 
                onClick={() => setIsQRISModalOpen(false)}
                className="w-full py-3 bg-[#0a0a0f] hover:bg-white/5 border border-[#1f1f2e] text-[#71717a] hover:text-white font-bold rounded-xl transition-all text-xs tracking-wider uppercase cursor-pointer"
              >
                Ganti Metode Pembayaran
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REGISTER / ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030306]/75 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-[#06060a] border border-[#1f1f2e] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-[#1f1f2e]/60 flex items-center justify-between shrink-0 bg-[#06060a]">
              <h2 className="text-lg font-display font-extrabold text-white uppercase tracking-wider">{editingId ? 'Edit Register Device' : 'Daftarkan Device IoT Baru'}</h2>
              <button onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="w-8 h-8 bg-[#0a0a0f] border border-[#1f1f2e] rounded-full flex items-center justify-center text-[#71717a] hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 overflow-y-auto bg-black/10 text-xs">
              <div>
                <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-2">Nama Perangkat / Device Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl p-3.5 text-white font-medium outline-none transition-all" placeholder="Contoh: Sensor Getaran & Kelembaban IoT" />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-2">Biaya Jual / Deploy (Rp)</label>
                  <input required type="text" inputMode="numeric" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value.replace(/\D/g, '')})} className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl p-3.5 text-white font-medium outline-none transition-all" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-2">Kuantitas Stok Awal</label>
                  <input required type="text" inputMode="numeric" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value.replace(/\D/g, '')})} className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl p-3.5 text-white font-medium outline-none transition-all" placeholder="0" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-2">Kategori Hardware</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl p-3.5 text-white font-medium outline-none transition-all" placeholder="Contoh: Sensor, Gateway" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-2">Protokol Jaringan</label>
                  <select value={formData.protocol} onChange={e => setFormData({...formData, protocol: e.target.value})} className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl p-3.5 text-white font-medium outline-none transition-all">
                    {['LoRaWAN', 'Wi-Fi', 'Zigbee', 'NB-IoT'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-2">Deskripsi Spesifikasi Perangkat</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl p-3.5 text-white font-medium outline-none transition-all" placeholder="Tuliskan detail module, frekuensi kerja, tipe mikrokontroler, dll..."></textarea>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider">Hologram / Foto Perangkat</label>
                  <span className="text-[10px] font-medium text-[#52525b]">Maksimal 5MB</span>
                </div>
                <div className="flex items-center gap-4 bg-[#0a0a0f] p-2 rounded-2xl border border-[#1f1f2e] shadow-sm">
                  {formData.image ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#1f1f2e] shrink-0 bg-black/40">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[#1f1f2e] bg-black/20 flex items-center justify-center text-[#3f3f46] shrink-0">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1 w-full text-xs text-[#71717a] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer outline-none" 
                  />
                </div>
              </div>

              {/* Shipping & Services */}
              <div className="bg-[#0a0a0f] p-4 rounded-2xl border border-[#1f1f2e] space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-3">Opsi Pengiriman & Pengantaran</label>
                  <div className="flex flex-wrap gap-4">
                    {Object.keys(formData.shipping).map(key => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.shipping[key]} 
                          onChange={e => setFormData({
                            ...formData, 
                            shipping: { ...formData.shipping, [key]: e.target.checked }
                          })}
                          className="w-4 h-4 text-emerald-500 rounded border-[#1f1f2e] bg-black focus:ring-emerald-500" 
                        />
                        <span className="text-xs font-semibold text-[#a1a1aa] capitalize">{key}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-[#52525b] uppercase tracking-wider mb-3">Layanan Pendukung Sistem</label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.services.instalasi} 
                        onChange={e => setFormData({
                          ...formData, 
                          services: { ...formData.services, instalasi: e.target.checked }
                        })}
                        className="w-4 h-4 mt-0.5 text-emerald-500 rounded border-[#1f1f2e] bg-black focus:ring-emerald-500" 
                      />
                      <span className="text-xs font-semibold text-[#a1a1aa] leading-tight">Kalibrasi & Panduan Pemrograman Awal</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.services.konsultasi} 
                        onChange={e => setFormData({
                          ...formData, 
                          services: { ...formData.services, konsultasi: e.target.checked }
                        })}
                        className="w-4 h-4 mt-0.5 text-emerald-500 rounded border-[#1f1f2e] bg-black focus:ring-emerald-500" 
                      />
                      <span className="text-xs font-semibold text-[#a1a1aa] leading-tight">Konsultasi Frekuensi Jaringan 24/7</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.services.garansi} 
                        onChange={e => setFormData({
                          ...formData, 
                          services: { ...formData.services, garansi: e.target.checked }
                        })}
                        className="w-4 h-4 mt-0.5 text-emerald-500 rounded border-[#1f1f2e] bg-black focus:ring-emerald-500" 
                      />
                      <span className="text-xs font-semibold text-[#a1a1aa] leading-tight">Garansi Hardware Ganti Unit Baru</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 shrink-0 border-t border-[#1f1f2e]/60">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="flex-1 py-3 bg-[#0a0a0f] border border-[#1f1f2e] text-[#71717a] hover:text-white rounded-xl font-bold transition-all">Batalkan</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-extrabold tracking-wider transition-all shadow-md shadow-emerald-500/10 flex justify-center items-center gap-2 cursor-pointer">
                  <CheckCircle2 className="w-4 h-4 font-black" /> SIMPAN PERUBAHAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL - DEPLOYMENT DEPOSIT */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#030306]/75 backdrop-blur-sm" onClick={() => setConfirmModal({ isOpen: false, type: null, id: null })}></div>
          <div className={`relative w-full bg-[#06060a] border border-[#1f1f2e] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh] ${confirmModal.type === 'checkout' ? 'max-w-2xl text-left' : 'max-w-sm text-center'}`}>
            
            {/* Header (only for checkout modal) */}
            {confirmModal.type === 'checkout' && (
              <div className="p-6 border-b border-[#1f1f2e]/60 flex justify-between items-center bg-[#06060a] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">
                    PROSES PEMBELIAN & CHECKOUT
                  </h3>
                </div>
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, type: null, id: null })} 
                  className="w-7 h-7 bg-[#0a0a0f] border border-[#1f1f2e] rounded-full flex items-center justify-center text-[#71717a] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-black/10 hide-scrollbar">
              {confirmModal.type !== 'checkout' ? (
                <div className="py-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-500/10 text-red-500">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-lg font-display font-extrabold text-white mb-2 uppercase tracking-wide">
                    KONFIRMASI HAPUS
                  </h3>
                  
                  <p className="text-xs text-[#a1a1aa] leading-relaxed mb-2 font-medium">
                    {confirmModal.type === 'product' && 'Yakin ingin menghapus spesifikasi perangkat ini secara permanen dari katalog?'}
                    {confirmModal.type === 'cart' && 'Yakin ingin membatalkan pembelian perangkat ini?'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6 text-xs">
                  {/* Shipping Info Form Block */}
                  <div>
                    <div className="flex items-center gap-2 text-white font-extrabold text-xs uppercase tracking-wider mb-3">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Informasi Pengiriman
                    </div>
                    <div className="space-y-2.5">
                      <div className="relative">
                        <User className="absolute left-4 top-3 w-4 h-4 text-[#52525b]" />
                        <input 
                          required 
                          type="text" 
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-[#52525b] outline-none transition-all" 
                          placeholder="Nama Lengkap Penerima" 
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3 w-4 h-4 text-[#52525b]" />
                        <input 
                          required 
                          type="tel" 
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={recipientPhone}
                          onChange={e => setRecipientPhone(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-[#52525b] outline-none transition-all" 
                          placeholder="Nomor WhatsApp (Aktif)" 
                        />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3 w-4 h-4 text-[#52525b]" />
                        <textarea 
                          required 
                          rows="2"
                          value={recipientAddress}
                          onChange={e => setRecipientAddress(e.target.value)}
                          className="w-full bg-[#0a0a0f] border border-[#1f1f2e] focus:border-emerald-500/50 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-[#52525b] outline-none transition-all resize-none" 
                          placeholder="Alamat Lengkap (Jalan, No. Rumah, Kota, Kode Pos)" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Courier Selection Block */}
                  <div>
                    <div className="flex items-center gap-2 text-white font-extrabold text-xs uppercase tracking-wider mb-3">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16v-4a1 1 0 00-.293-.707l-3-3A1 1 0 0017 8h-4v8m-4 0h12" />
                      </svg>
                      Pilih Ekspedisi
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* JNE */}
                      <button 
                        type="button"
                        onClick={() => setSelectedCourier('JNE')}
                        className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden ${selectedCourier === 'JNE' ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'bg-[#0a0a0f] border-[#1f1f2e] text-[#a1a1aa] hover:border-[#27272a]'}`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-[10px] block text-white uppercase tracking-wider">JNE Reguler (REG)</span>
                          <span className="text-[8px] text-[#71717a] font-bold block">Estimasi 3-5 Hari</span>
                        </div>
                        <span className="font-display font-black text-xs text-emerald-400">Rp 50.000</span>
                      </button>

                      {/* J&T */}
                      <button 
                        type="button"
                        onClick={() => setSelectedCourier('J&T')}
                        className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden ${selectedCourier === 'J&T' ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'bg-[#0a0a0f] border-[#1f1f2e] text-[#a1a1aa] hover:border-[#27272a]'}`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-[10px] block text-white uppercase tracking-wider">J&T Express</span>
                          <span className="text-[8px] text-[#71717a] font-bold block">Estimasi 1-2 Hari</span>
                        </div>
                        <span className="font-display font-black text-xs text-emerald-400">Rp 150.000</span>
                      </button>

                      {/* Indah Logistik */}
                      <button 
                        type="button"
                        onClick={() => setSelectedCourier('Indah')}
                        className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden ${selectedCourier === 'Indah' ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'bg-[#0a0a0f] border-[#1f1f2e] text-[#a1a1aa] hover:border-[#27272a]'}`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-[10px] block text-white uppercase tracking-wider">Indah Logistik</span>
                          <span className="text-[8px] text-[#71717a] font-bold block">Estimasi 5-7 Hari</span>
                        </div>
                        <span className="font-display font-black text-xs text-emerald-400">Rp 350.000</span>
                      </button>
                    </div>
                  </div>

                  {/* Kanal Deposit */}
                  <div>
                    <div className="text-[9px] font-black text-[#52525b] uppercase tracking-wider mb-2.5">Pilih Kanal Deposit:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Cash', 'QRIS', 'Debit Card', 'Transfer'].map(method => (
                        <button
                          type="button"
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2.5 px-2 rounded-xl text-[10px] font-extrabold border transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${paymentMethod === method ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500' : 'bg-black border-[#1f1f2e] text-[#a1a1aa] hover:border-[#27272a] hover:text-white'}`}
                        >
                          {method === 'QRIS' && <QrCode className="w-3.5 h-3.5 text-emerald-400 animate-pulse animate-duration-1000" />}
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-[#0a0a0f] p-4 border border-[#1f1f2e]/60 rounded-2xl mb-2 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[#71717a] font-semibold block">Subtotal Perangkat: {formatRupiah(total)}</span>
                      <span className="text-[#71717a] font-semibold block">Ongkos Kirim ({selectedCourier}): {formatRupiah(shippingCost)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black text-[#52525b] uppercase tracking-wider block">TOTAL PEMBAYARAN</span>
                      <span className="font-display font-black text-emerald-400 text-glow-emerald text-base">{formatRupiah(finalTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="p-6 border-t border-[#1f1f2e]/60 bg-[#06060a] shrink-0">
              <div className="flex gap-3 text-xs">
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, type: null, id: null })} 
                  className="flex-1 py-3 bg-[#0a0a0f] border border-[#1f1f2e] text-[#71717a] hover:text-white rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmAction} 
                  className={`flex-1 py-3 text-black font-extrabold tracking-wider rounded-xl transition-all shadow-lg cursor-pointer ${confirmModal.type === 'checkout' ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/10' : 'bg-red-500 hover:bg-red-600 shadow-red-500/10 text-white'}`}
                >
                  {confirmModal.type === 'checkout' ? 'YA, BELI SEKARANG' : 'YA, HAPUS'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DETAIL MODAL - HOLOGRAPHIC STYLE */}
      {detailModalProduct && (
        <div className="fixed inset-0 z-[80] flex justify-center items-end sm:items-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-[#030306]/75 backdrop-blur-sm transition-opacity" onClick={() => setDetailModalProduct(null)}></div>
          <div className="relative w-full sm:w-auto max-w-2xl bg-[#06060a] border border-[#1f1f2e] rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 sm:p-6 border-b border-[#1f1f2e]/60 flex items-center justify-between shrink-0 bg-[#06060a] sticky top-0 z-10">
              <h2 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">Device Specification Details</h2>
              <button onClick={() => setDetailModalProduct(null)} className="w-8 h-8 bg-[#0a0a0f] border border-[#1f1f2e] rounded-full flex items-center justify-center text-[#71717a] hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto bg-black/10 text-xs hide-scrollbar">
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <div className="w-full sm:w-1/2 shrink-0">
                  <div className="aspect-square rounded-2xl bg-black/40 border border-[#1f1f2e]/60 overflow-hidden flex items-center justify-center">
                    {detailModalProduct.image ? (
                      <img src={detailModalProduct.image} alt={detailModalProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[#3f3f46] flex flex-col items-center gap-2">
                        <Cpu className="w-12 h-12" />
                        <span className="text-[10px] font-bold tracking-widest text-[#71717a]">INTELLIGENT NODE</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="px-3 py-1 w-max bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2 border border-emerald-500/20">
                    {detailModalProduct.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white leading-tight mb-2">
                    {detailModalProduct.name}
                  </h3>
                  
                  <div className="text-2xl font-display font-black text-emerald-400 text-glow-emerald mb-4">
                    {formatRupiah(detailModalProduct.price)}
                  </div>
                  
                  <div className="text-[#a1a1aa] text-xs mb-6 whitespace-pre-line leading-relaxed font-medium">
                    {detailModalProduct.description || "Tidak ada rincian spesifikasi tambahan."}
                  </div>
                  
                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => { toast.success('Disimpan ke Node Wishlist!'); }}
                      className="w-12 h-12 bg-white/5 hover:bg-emerald-500/10 text-[#a1a1aa] hover:text-emerald-400 border border-[#1f1f2e] rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer"
                      title="Wishlist"
                    >
                      <Heart className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => { addToCart(detailModalProduct); setDetailModalProduct(null); }}
                      disabled={detailModalProduct.stock <= 0}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:bg-[#1f1f2e] disabled:text-[#52525b] disabled:shadow-none cursor-pointer"
                    >
                      <Plus className="w-4 h-4 font-black" /> Tambah ke Deployment
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0a0a0f] rounded-2xl p-5 border border-[#1f1f2e]/60">
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wide text-[10px]"><Info className="w-4 h-4 text-emerald-400"/> Spesifikasi Fisik Hardware</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="block text-[#52525b] font-black uppercase text-[8px] mb-1">Stok Tersedia</span>
                      <span className="text-white font-mono">{detailModalProduct.stock} unit</span>
                    </div>
                    <div>
                      <span className="block text-[#52525b] font-black uppercase text-[8px] mb-1">Protokol Jaringan</span>
                      <span className="text-cyan-400 font-bold uppercase">{detailModalProduct.protocol || 'LoRaWAN'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0f] rounded-2xl p-5 border border-[#1f1f2e]/60">
                  <h4 className="font-bold text-white mb-3 uppercase tracking-wide text-[10px]">Kapasitas Layanan Pendukung</h4>
                  <ul className="space-y-2 text-xs text-[#a1a1aa] font-semibold">
                    {(detailModalProduct.services?.instalasi !== false) && (
                      <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</div> Kalibrasi & Panduan Pemrograman Awal</li>
                    )}
                    {(detailModalProduct.services?.konsultasi !== false) && (
                      <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</div> Konsultasi Frekuensi Jaringan 24/7</li>
                    )}
                    {(detailModalProduct.services?.garansi !== false) && (
                      <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</div> Garansi Hardware Ganti Unit Baru</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
