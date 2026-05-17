export default function Wishlist() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen text-center flex flex-col items-center">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-red-500 text-4xl">❤️</span>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Wishlist Anda</h1>
      <p className="text-gray-500 mb-8">Belum ada produk di wishlist.</p>
    </div>
  );
}
