import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { formatRupiah } from '../data/products';
import toast, { Toaster } from 'react-hot-toast';

export default function ManageProducts() {
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    image: ''
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image: product.image || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', stock: '', category: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { name, price, stock, category, image } = formData;
    
    if (!name || !price || !stock || !category) {
      toast.error('Mohon lengkapi data produk!');
      return;
    }

    const payload = {
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      image
    };

    try {
      if (editingId) {
        await db.products.update(editingId, payload);
        toast.success('Produk diperbarui!');
      } else {
        await db.products.add(payload);
        toast.success('Produk ditambahkan!');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Terjadi kesalahan!');
    }
  };

  const requestDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await db.products.delete(deleteConfirmId);
      toast.success('Produk dihapus!');
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Toaster position="top-center" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-500 mt-1">Tambah, ubah, atau hapus data produk.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[var(--color-brand)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--color-brand-hover)] transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Gambar</th>
              <th className="p-4 font-semibold">Nama Produk</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold">Harga</th>
              <th className="p-4 font-semibold">Stok</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-8 text-gray-500">
                  Belum ada produk di database. Silakan tambah produk baru.
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <img src={product.image || 'https://images.unsplash.com/photo-1541888081622-1d54f7622877?w=150'} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  </td>
                  <td className="p-4 font-bold text-gray-800">{product.name}</td>
                  <td className="p-4 text-sm text-gray-500">
                    <span className="px-2.5 py-1 bg-emerald-50 text-[var(--color-brand)] rounded-md font-medium whitespace-nowrap">{product.category}</span>
                  </td>
                  <td className="p-4 font-bold text-[var(--color-brand)] whitespace-nowrap">{formatRupiah(product.price)}</td>
                  <td className="p-4 font-medium text-gray-700">{product.stock}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors mr-2 inline-flex" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => requestDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] outline-none" placeholder="Cth: Bor Listrik Pintar" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] outline-none" placeholder="Cth: Perkakas" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                  <input required type="text" inputMode="numeric" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value.replace(/\D/g, '')})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] outline-none" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                <input required type="text" inputMode="numeric" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value.replace(/\D/g, '')})} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
                <div className="flex items-center gap-4">
                  {formData.image ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, image: ''})}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400 flex-shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1 w-full border border-gray-300 rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-[var(--color-brand)] hover:file:bg-emerald-100 outline-none cursor-pointer" 
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Pilih gambar dari perangkat Anda. Maksimal 2MB.</p>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[var(--color-brand)] text-white rounded-xl font-bold hover:bg-[var(--color-brand-hover)] transition-colors shadow-lg shadow-emerald-600/30">
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden text-center p-6">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-500 mb-6">
              Anda yakin ingin menghapus produk ini secara permanen?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
