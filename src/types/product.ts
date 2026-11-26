export const PRODUCT_CONSTRAINTS = {
  NAME_MIN: 2,
  NAME_MAX: 120,
  DESC_MAX: 1500,
  CATEGORY_MIN: 1,
  CATEGORY_MAX: 60,
  PRICE_MIN: 0,
  PRICE_MAX: 100000000,
  STOCK_MIN: 0,
  STOCK_MAX: 1000000,
  IMAGE_URL_MAX: 200000,
} as const;

export const DEFAULT_CATEGORIES = [
  'Home & Living',
  'Apparel',
  'Bags & Carry',
  'Lighting',
  'Coffee & Kitchen',
  'Accessories',
] as const;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  ownerId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
}

export interface StudioPresetImage {
  label: string;
  url: string;
}

export const STUDIO_PRESET_IMAGES: StudioPresetImage[] = [
  {
    label: 'Stoneware Ceramic Pitcher',
    url: '/src/assets/images/product_ceramic_vase_1795682127142.jpg',
  },
  {
    label: 'Washed Linen Overshirt',
    url: '/src/assets/images/product_linen_overshirt_1795682126909.jpg',
  },
  {
    label: 'Espresso Leather Tote',
    url: '/src/assets/images/product_leather_tote_1795682127234.jpg',
  },
  {
    label: 'Brushed Brass Desk Lamp',
    url: '/src/assets/images/product_brass_lamp_1795682127537.jpg',
  },
  {
    label: 'Ceramic Pour-Over Set',
    url: '/src/assets/images/product_coffee_dripper_1795682129768.jpg',
  },
];

export const HERO_IMAGE_URL = '/src/assets/images/hero_curated_storefront_1795682126841.jpg';

export const STARTER_SHOWCASE_PRODUCTS: Omit<Product, 'ownerId' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'sample-ceramic-pitcher',
    name: 'Kuro Stoneware Pitcher Vase',
    description:
      'Hand-thrown matte stoneware pitcher finished in warm ash glaze. Holds dried botanicals or fresh stems with an architectural silhouette.',
    price: 1650,
    category: 'Home & Living',
    stock: 7,
    imageUrl: '/src/assets/images/product_ceramic_vase_1795682127142.jpg',
    isPublished: true,
    isFeatured: true,
  },
  {
    id: 'sample-linen-overshirt',
    name: 'Heavyweight Washed Linen Overshirt',
    description:
      'Breathable 240gsm stone-washed European linen tailored in a relaxed boxy cut with corozo nut buttons and single chest pocket.',
    price: 2890,
    category: 'Apparel',
    stock: 12,
    imageUrl: '/src/assets/images/product_linen_overshirt_1795682126909.jpg',
    isPublished: true,
    isFeatured: true,
  },
  {
    id: 'sample-leather-tote',
    name: 'Solana Vegetable-Tanned Leather Tote',
    description:
      'Full-grain espresso leather everyday carryall with solid brass rivets, reinforced base, and room for a 15-inch laptop.',
    price: 5400,
    category: 'Bags & Carry',
    stock: 4,
    imageUrl: '/src/assets/images/product_leather_tote_1795682127234.jpg',
    isPublished: true,
    isFeatured: true,
  },
  {
    id: 'sample-brass-lamp',
    name: 'Atelier Articulated Brass Desk Lamp',
    description:
      'Precision-machined brushed brass arm paired with a matte obsidian aluminum shade and warm 2700K integrated LED diffuser.',
    price: 4250,
    category: 'Lighting',
    stock: 5,
    imageUrl: '/src/assets/images/product_brass_lamp_1795682127537.jpg',
    isPublished: true,
    isFeatured: false,
  },
  {
    id: 'sample-coffee-dripper',
    name: 'Origin Matte Ceramic Pour-Over Set',
    description:
      'Ribbed heat-retaining ceramic V60 dripper paired with a 600ml borosilicate glass carafe and walnut handle for clean daily brewing.',
    price: 2150,
    category: 'Coffee & Kitchen',
    stock: 9,
    imageUrl: '/src/assets/images/product_coffee_dripper_1795682129768.jpg',
    isPublished: true,
    isFeatured: false,
  },
];
