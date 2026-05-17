import Dexie from 'dexie';
import { products as initialProducts } from './data/products';

export const db = new Dexie('CivilSmartDB');
db.version(1).stores({
  products: '++id, name, price, stock, category, image'
});


db.on('populate', () => {
  const mappedProducts = initialProducts.map(p => ({
    name: p.name,
    price: p.price,
    stock: p.stock,
    category: p.category,
    image: p.image
  }));
  db.products.bulkAdd(mappedProducts);
});
