export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Hubungi Kami</h1>
      <div className="max-w-2xl bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
            <textarea rows="4" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] outline-none"></textarea>
          </div>
          <button type="button" className="w-full bg-[var(--color-brand)] text-white font-bold py-3 rounded-lg hover:bg-[var(--color-brand-hover)] transition-colors">
            Kirim Pesan
          </button>
        </form>
      </div>
    </div>
  );
}
