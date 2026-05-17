export const products = [
  {
    id: 1,
    name: "Smart Concrete Monitoring Sensor",
    price: 2499000,
    originalPrice: 2999000,
    discount: 17,
    rating: 4.8,
    reviews: 124,
    sold: 342,
    stock: 45,
    category: "Sensors",
    image: "https://images.unsplash.com/photo-1590496794008-383c8070b257?auto=format&fit=crop&q=80&w=800",
    description: "Sensor pintar untuk memonitor suhu dan kelembapan beton secara real-time.",
    fullDescription: "Smart Concrete Monitoring Sensor adalah solusi IoT terdepan untuk memastikan kualitas beton Anda. Dengan kemampuan monitoring suhu dan kelembapan secara real-time, Anda dapat menghindari keretakan struktural dan memastikan proses curing berjalan sempurna. Data dikirimkan langsung ke dashboard di smartphone atau komputer Anda.",
    features: [
      "Data real-time 24/7",
      "Monitoring online via Cloud",
      "Notifikasi otomatis jika suhu di luar batas",
      "Baterai tahan hingga 6 bulan",
      "Konektivitas WiFi & LoRa"
    ],
    isBestSeller: true,
  },
  {
    id: 2,
    name: "AI Crack Detection Camera",
    price: 4999000,
    originalPrice: 5500000,
    discount: 9,
    rating: 4.9,
    reviews: 89,
    sold: 156,
    stock: 12,
    category: "Monitoring",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80&w=800",
    description: "Kamera AI untuk mendeteksi retakan struktur bangunan secara otomatis.",
    fullDescription: "Dilengkapi dengan teknologi Computer Vision dan AI Machine Learning terbaru, kamera ini dirancang khusus untuk mendeteksi retakan mikroskopis pada struktur bangunan, jembatan, dan jalan. Sistem akan secara otomatis mengklasifikasikan tingkat bahaya retakan dan memberikan laporan instan.",
    features: [
      "Deteksi cepat dan otomatis",
      "Analisis AI terintegrasi",
      "Akurasi tinggi hingga 99.8%",
      "Tahan cuaca ekstrem (IP67)",
      "Integrasi mudah dengan sistem VMS"
    ],
    isBestSeller: true,
  },
  {
    id: 3,
    name: "Smart Safety Helmet",
    price: 1299000,
    originalPrice: 1599000,
    discount: 19,
    rating: 4.7,
    reviews: 210,
    sold: 890,
    stock: 120,
    category: "Safety",
    image: "https://images.unsplash.com/photo-1621538356133-c2471c08d132?auto=format&fit=crop&q=80&w=800",
    description: "Helm proyek pintar dengan sensor keamanan dan GPS.",
    fullDescription: "Smart Safety Helmet meningkatkan standar keselamatan kerja ke level selanjutnya. Helm ini dilengkapi dengan sensor benturan, deteksi jatuh, dan GPS tracking. Jika terjadi kecelakaan, helm akan otomatis mengirimkan sinyal SOS ke pusat kendali beserta lokasi akurat pekerja.",
    features: [
      "Tracking lokasi real-time",
      "Sensor keselamatan & deteksi jatuh",
      "Monitoring pekerja aktif",
      "Tombol SOS darurat",
      "Ringan dan ergonomis"
    ],
    isBestSeller: false,
  },
  {
    id: 4,
    name: "Smart Drone Survey Kit",
    price: 6499000,
    originalPrice: 7999000,
    discount: 18,
    rating: 5.0,
    reviews: 56,
    sold: 112,
    stock: 5,
    category: "Surveying",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800",
    description: "Drone pemetaan proyek dengan sensor dan analisis data otomatis.",
    fullDescription: "Smart Drone Survey Kit adalah paket lengkap untuk pemetaan topografi dan inspeksi proyek. Menggunakan teknologi LiDAR ringan dan kamera fotogrametri resolusi tinggi, drone ini dapat memetakan area proyek dalam hitungan menit dan menghasilkan model 3D yang akurat di cloud.",
    features: [
      "Pemetaan cepat dan presisi",
      "Akurasi tinggi hingga hitungan milimeter",
      "Integrasi cloud untuk pemrosesan data",
      "Otonom waypoint navigation",
      "Baterai ganda untuk durasi terbang ekstra"
    ],
    isBestSeller: true,
  }
];

export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};
