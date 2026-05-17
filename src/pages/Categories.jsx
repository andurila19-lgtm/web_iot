export default function Categories() {
  const categories = ['Sensor IoT', 'Monitoring Visual', 'Keselamatan Pintar', 'Alat Survey'];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Kategori Produk</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[var(--color-brand)] cursor-pointer transition-all">
            <h2 className="text-2xl font-bold text-[var(--color-brand)]">{category}</h2>
            <p className="text-gray-500 mt-2">Jelajahi produk di kategori {category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
