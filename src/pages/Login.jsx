export default function Login() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl">
        <h1 className="text-2xl font-extrabold text-center text-gray-900 mb-8">Login ke Akun Anda</h1>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] outline-none" />
          </div>
          <button type="button" className="w-full bg-[var(--color-brand)] text-white font-bold py-3 rounded-lg hover:bg-[var(--color-brand-hover)] transition-colors">
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
