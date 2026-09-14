export interface Product {
  id: string;
  title: string;
  category: 'kits' | 'supplements' | 'fresh' | 'foraged';
  price: number;
  description: string;
  badge: string;
  color: string;
  moq: string;
  leadTime: string;
  image: string;
}

export const products: Product[] = [
  {
    id: '1',
    title: 'Blue Oyster Grow Kits — Pallet of 48',
    category: 'kits',
    price: 650,
    description: 'Organic grow kits for retailers and distributors. Each pallet contains 48 units.',
    badge: 'Bulk',
    color: '#5A8F9E',
    moq: '1 pallet (48 units)',
    leadTime: '5–7 business days',
    image: '/assets/products/p1.png'
  },
  {
    id: '2',
    title: 'Lion\'s Mane Focus Tincture — Case of 24',
    category: 'supplements',
    price: 480,
    description: 'Double-extracted liquid tincture for white-label or retail display.',
    badge: 'Case',
    color: '#B8957A',
    moq: '1 case (24 units)',
    leadTime: '7–10 business days',
    image: '/assets/products/p2.png'
  },
  {
    id: '3',
    title: 'Maitake Fruiting Blocks — Pack of 12',
    category: 'fresh',
    price: 120,
    description: 'High-yield blocks for commercial kitchens and farms.',
    badge: 'Pack',
    color: '#D96B43',
    moq: '1 pack (12 blocks)',
    leadTime: '3–5 business days',
    image: '/assets/products/p3.png'
  },
  {
    id: '4',
    title: 'Wild Cascade Chanterelles — 10 lb Crate',
    category: 'foraged',
    price: 280,
    description: 'Restaurant-grade chanterelles, wild-harvested in Oregon. Seasonal availability.',
    badge: 'Seasonal',
    color: '#C4A35A',
    moq: '1 crate (10 lbs)',
    leadTime: '2–3 business days',
    image: '/assets/products/p4.png'
  },
  {
    id: '5',
    title: 'Golden Oyster Liquid Culture — 10 Syringes',
    category: 'kits',
    price: 150,
    description: 'High-viability mycelium syringe pack for commercial inoculation.',
    badge: 'Bulk',
    color: '#7DA68C',
    moq: '1 pack (10 syringes)',
    leadTime: '3–5 business days',
    image: '/assets/products/p5.png'
  },
  {
    id: '6',
    title: 'Cordyceps Energy Gummies — Case of 36',
    category: 'supplements',
    price: 540,
    description: 'Vegan energy gummies for health store retail distribution.',
    badge: 'Case',
    color: '#C46A5A',
    moq: '1 case (36 bottles)',
    leadTime: '7–10 business days',
    image: '/assets/products/p6.png'
  },
  {
    id: '7',
    title: 'Chef\'s Reserve Alba Truffles — 1 lb Lot',
    category: 'foraged',
    price: 2400,
    description: 'Premium white truffles sourced directly from Piedmont, Italy. Limited seasonal availability.',
    badge: 'Seasonal',
    color: '#C4A35A',
    moq: '1 lb',
    leadTime: 'Special order — inquire for timing',
    image: '/assets/products/p7.png'
  },
  {
    id: '8',
    title: 'Shiitake Fruiting Blocks — Pack of 24',
    category: 'fresh',
    price: 200,
    description: 'Consistent, high-yield shiitake blocks for restaurant supply chains.',
    badge: 'Pack',
    color: '#8A9A86',
    moq: '1 pack (24 blocks)',
    leadTime: '3–5 business days',
    image: '/assets/products/p8.png'
  }
];

export const categories = ['all', 'kits', 'supplements', 'fresh', 'foraged'] as const;
export type Category = typeof categories[number];

export const categoryLabels: Record<Category, string> = {
  all: 'All Products',
  kits: 'Grow Kits',
  supplements: 'Extracts',
  fresh: 'Fresh Mushrooms',
  foraged: 'Foraged'
};

export const productImages: Record<string, string> = {
  kits: '/assets/products/p1.png',
  supplements: '/assets/products/p2.png',
  fresh: '/assets/products/p3.png',
  foraged: '/assets/products/p4.png'
};
