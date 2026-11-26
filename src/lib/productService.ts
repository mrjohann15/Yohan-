import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  PRODUCT_CONSTRAINTS,
  Product,
  ProductFormData,
  STARTER_SHOWCASE_PRODUCTS,
} from '../types/product';

const PRODUCTS_COLLECTION = 'products';

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return null;
}

export function sanitizeProductPayload(input: ProductFormData): ProductFormData {
  const name = input.name.trim().slice(0, PRODUCT_CONSTRAINTS.NAME_MAX);
  const description = input.description.trim().slice(0, PRODUCT_CONSTRAINTS.DESC_MAX);
  const category = input.category.trim().slice(0, PRODUCT_CONSTRAINTS.CATEGORY_MAX);
  const imageUrl = input.imageUrl.trim().slice(0, PRODUCT_CONSTRAINTS.IMAGE_URL_MAX);
  const price = Math.max(
    PRODUCT_CONSTRAINTS.PRICE_MIN,
    Math.min(PRODUCT_CONSTRAINTS.PRICE_MAX, Number(input.price) || 0)
  );
  const stock = Math.max(
    PRODUCT_CONSTRAINTS.STOCK_MIN,
    Math.min(PRODUCT_CONSTRAINTS.STOCK_MAX, Math.floor(Number(input.stock) || 0))
  );

  if (name.length < PRODUCT_CONSTRAINTS.NAME_MIN) {
    throw new Error(`Ang pangalan ng produkto ay dapat may hindi bababa sa ${PRODUCT_CONSTRAINTS.NAME_MIN} letra.`);
  }
  if (category.length < PRODUCT_CONSTRAINTS.CATEGORY_MIN) {
    throw new Error('Pumili o maglagay ng kategorya ng produkto.');
  }
  if (input.imageUrl.trim().length > PRODUCT_CONSTRAINTS.IMAGE_URL_MAX) {
    throw new Error('Masyadong mahaba ang image URL o malaki ang image file.');
  }

  return {
    name,
    description,
    price: Math.round(price * 100) / 100,
    category,
    stock,
    imageUrl,
    isPublished: Boolean(input.isPublished),
    isFeatured: Boolean(input.isFeatured),
  };
}

export function subscribeProducts(
  isOwner: boolean,
  onData: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const q = isOwner ? query(productsRef) : query(productsRef, where('isPublished', '==', true));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Product[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: typeof data.name === 'string' ? data.name : '',
          description: typeof data.description === 'string' ? data.description : '',
          price: typeof data.price === 'number' ? data.price : 0,
          category: typeof data.category === 'string' ? data.category : 'Uncategorized',
          stock: typeof data.stock === 'number' ? data.stock : 0,
          imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
          isPublished: Boolean(data.isPublished),
          isFeatured: Boolean(data.isFeatured),
          ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        };
      });

      items.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });

      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function createProduct(input: ProductFormData): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Kailangang naka-sign in bilang owner bago mag-add ng produkto.');
  }

  const clean = sanitizeProductPayload(input);
  const newDocRef = doc(collection(db, PRODUCTS_COLLECTION));
  const path = `${PRODUCTS_COLLECTION}/${newDocRef.id}`;

  try {
    await setDoc(newDocRef, {
      ...clean,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProduct(productId: string, input: ProductFormData): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Kailangang naka-sign in bilang owner bago mag-edit ng produkto.');
  }

  const clean = sanitizeProductPayload(input);
  const path = `${PRODUCTS_COLLECTION}/${productId}`;

  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      name: clean.name,
      description: clean.description,
      price: clean.price,
      category: clean.category,
      stock: clean.stock,
      imageUrl: clean.imageUrl,
      isPublished: clean.isPublished,
      isFeatured: clean.isFeatured,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Kailangang naka-sign in bilang owner bago mag-delete ng produkto.');
  }

  const path = `${PRODUCTS_COLLECTION}/${productId}`;

  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedStarterProducts(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Kailangang naka-sign in bilang owner.');
  }

  try {
    const batch = writeBatch(db);
    for (const item of STARTER_SHOWCASE_PRODUCTS) {
      const docRef = doc(collection(db, PRODUCTS_COLLECTION));
      batch.set(docRef, {
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        stock: item.stock,
        imageUrl: item.imageUrl,
        isPublished: item.isPublished,
        isFeatured: item.isFeatured,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
  }
}
