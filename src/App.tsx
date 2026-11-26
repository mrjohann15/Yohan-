import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { LogOut, Plus, Search, Sparkles } from 'lucide-react';
import { auth, googleProvider, OWNER_EMAIL } from './lib/firebase';
import {
  createProduct,
  deleteProduct,
  seedStarterProducts,
  subscribeProducts,
  updateProduct,
} from './lib/productService';
import { Product, ProductFormData, STARTER_SHOWCASE_PRODUCTS } from './types/product';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductFormModal } from './components/ProductFormModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

function StorefrontApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [seeding, setSeeding] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const isOwner = Boolean(
    user && user.email === OWNER_EMAIL && user.emailVerified
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    setProductsLoading(true);
    setProductsError(null);

    const unsubscribe = subscribeProducts(
      isOwner,
      (items) => {
        setLiveProducts(items);
        setProductsLoading(false);
      },
      (err) => {
        setProductsError(err.message);
        setProductsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authReady, isOwner]);

  useEffect(() => {
    if (!statusNotice) return;
    const timer = setTimeout(() => setStatusNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [statusNotice]);

  const handleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Hindi nakapag-sign in gamit ang Google.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setStatusNotice('Naka-sign out ka na sa Owner mode.');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Hindi makapag-sign out.');
    }
  };

  const handleSaveProduct = async (formData: ProductFormData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
      setStatusNotice(`Na-update ang "${formData.name}".`);
    } else {
      await createProduct(formData);
      setStatusNotice(`Naidagdag ang "${formData.name}" sa catalog.`);
    }
  };

  const handleConfirmDelete = async (product: Product) => {
    await deleteProduct(product.id);
    setStatusNotice(`Na-delete ang "${product.name}".`);
  };

  const handleLoadStarterItems = async () => {
    setSeeding(true);
    setAuthError(null);
    try {
      await seedStarterProducts();
      setStatusNotice('Na-import ang 5 sample products sa iyong live store.');
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Hindi ma-load ang sample products.'
      );
    } finally {
      setSeeding(false);
    }
  };

  const isSampleMode = !productsLoading && liveProducts.length === 0 && !isOwner;

  const displaySourceProducts: Product[] = useMemo(() => {
    if (liveProducts.length > 0) return liveProducts;
    if (isSampleMode) {
      return STARTER_SHOWCASE_PRODUCTS.map((item) => ({
        ...item,
        ownerId: 'showcase',
        createdAt: null,
        updatedAt: null,
      }));
    }
    return [];
  }, [liveProducts, isSampleMode]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of displaySourceProducts) {
      if (item.category) set.add(item.category);
    }
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [displaySourceProducts]);

  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = displaySourceProducts.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (onlyFeatured && !item.isFeatured) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });

    const sorted = [...list];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [displaySourceProducts, selectedCategory, onlyFeatured, searchQuery, sortBy]);

  const inStockCount = useMemo(
    () => displaySourceProducts.filter((p) => p.stock > 0 && p.isPublished).length,
    [displaySourceProducts]
  );

  const publishedCount = useMemo(
    () => liveProducts.filter((p) => p.isPublished).length,
    [liveProducts]
  );

  const draftCount = liveProducts.length - publishedCount;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111827]">
      <Header
        isOwner={isOwner}
        authLoading={authLoading}
        onOwnerSignIn={handleSignIn}
        onAddProduct={() => {
          setEditingProduct(null);
          setIsFormOpen(true);
        }}
      />

      <main className="flex-1">
        <Hero
          totalItems={displaySourceProducts.length}
          inStockItems={inStockCount}
          isOwner={isOwner}
          onAddProduct={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
        />

        {/* Section 2: Product Catalog */}
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Owner Management Bar */}
          {user && (
            <div className="mb-8 p-4 sm:p-5 bg-white border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {isOwner ? (
                <>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Owner Inventory Controls
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Signed in as {user.email} ·{' '}
                      <span className="font-mono-tabular">
                        {liveProducts.length} total ({publishedCount} live, {draftCount} draft)
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {liveProducts.length === 0 && (
                      <button
                        type="button"
                        disabled={seeding}
                        onClick={handleLoadStarterItems}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{seeding ? 'Importing...' : 'Load 5 Sample Items'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setIsFormOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-medium text-white bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Add Product</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Signed in as {user.email}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Viewer account lamang ito. Ang verified shop owner lang ang maaaring mag-add, edit, o delete ng produkto.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          )}

          {authError && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800"
            >
              {authError}
            </div>
          )}

          {statusNotice && (
            <div
              role="status"
              className="mb-6 p-4 rounded-xl bg-[#14532D]/10 border border-[#14532D]/20 text-sm font-medium text-[#14532D]"
            >
              {statusNotice}
            </div>
          )}

          {/* Catalog Header & Filter Controls */}
          <div id="featured" className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-zinc-900 text-balance">
                Lahat ng Produktong Inooffer
              </h2>
              <p className="text-sm text-zinc-600 mt-1.5">
                {isSampleMode
                  ? 'Sample catalog showcase — mag-sign in bilang owner para mag-publish ng sarili mong mga item.'
                  : 'Pumili ng kategorya o i-click ang kahit anong item para makita ang buong detalye.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search
                  className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hanapin ang item..."
                  aria-label="Search products"
                  className="w-full pl-10 pr-3.5 py-2 min-h-[42px] text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#14532D]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort products"
                className="px-3.5 py-2 min-h-[42px] text-sm bg-white border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:border-[#14532D]"
              >
                <option value="newest">Pinakabago</option>
                <option value="price-asc">Presyo: Mababa hanggang Mataas</option>
                <option value="price-desc">Presyo: Mataas hanggang Mababa</option>
                <option value="name-asc">Pangalan: A–Z</option>
              </select>
            </div>
          </div>

          {/* Interactive Category & Featured Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200">
            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Categories">
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-2 min-h-[38px] text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#14532D] text-white'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOnlyFeatured((prev) => !prev)}
              className={`px-3.5 py-2 min-h-[38px] text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                onlyFeatured
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {onlyFeatured ? 'Showing Featured Only' : 'Featured Items'}
            </button>
          </div>

          {/* Grid States: Loading / Error / Empty / Products */}
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-zinc-200 rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-zinc-200/70" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-28 bg-zinc-200 rounded" />
                    <div className="h-5 w-3/4 bg-zinc-200 rounded" />
                    <div className="h-4 w-full bg-zinc-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : productsError ? (
            <div className="bg-white border border-rose-200 rounded-xl p-8 text-center">
              <h3 className="font-display text-xl font-semibold text-zinc-900 mb-2">
                Hindi ma-load ang catalog
              </h3>
              <p className="text-sm text-zinc-600 mb-4 max-w-md mx-auto">
                Nagkaroon ng error habang kinukuha ang mga produkto sa database.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg"
              >
                Subukan Ulit
              </button>
            </div>
          ) : isOwner && liveProducts.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center max-w-2xl mx-auto">
              <h3 className="font-display text-2xl font-semibold text-zinc-900 mb-2">
                Handa na ang iyong tindahan
              </h3>
              <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
                Wala pang naka-save na produkto sa live database. Maaari kang magdagdag ng una mong
                item ngayon o mag-import ng 5 sample products para makapagsimula agad.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsFormOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] text-sm font-medium text-white bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Add Your First Product</span>
                </button>
                <button
                  type="button"
                  disabled={seeding}
                  onClick={handleLoadStarterItems}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] text-sm font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>{seeding ? 'Importing...' : 'Load 5 Sample Items'}</span>
                </button>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center">
              <h3 className="font-display text-xl font-semibold text-zinc-900 mb-2">
                Walang nahanap na produkto
              </h3>
              <p className="text-sm text-zinc-600 mb-5">
                Walang tugmang item sa iyong search o napiling kategorya.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setOnlyFeatured(false);
                }}
                className="px-4 py-2 min-h-[40px] text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                I-reset ang Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isOwner={isOwner}
                  isSamplePreview={isSampleMode}
                  onSelect={(item) => setDetailProduct(item)}
                  onEdit={(item) => {
                    setEditingProduct(item);
                    setIsFormOpen(true);
                  }}
                  onDelete={(item) => setDeletingProduct(item)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 3: About & How to Order */}
        <section id="about" className="border-t border-zinc-200 bg-white">
          <div
            id="order-guide"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16"
          >
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[#14532D] mb-2">
                About Tala Goods
              </p>
              <h2 className="font-display text-2xl font-semibold text-zinc-900 mb-3 text-balance">
                Direktang pagbebenta mula sa owner patungo sa buyer.
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed max-w-lg">
                Bawat produktong nakalista rito ay personal na pinili, sinuri, at ina-update ng shop
                owner. Makikita mo rito ang eksaktong presyo, larawan, at kung ilan pang stock ang
                natitira bago ka umorder.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-medium tracking-widest uppercase text-zinc-500">
                Paano Mag-Inquire o Umorder
              </p>
              <div className="space-y-3 text-sm text-zinc-700">
                <p>
                  <span className="font-semibold text-zinc-900">01. Piliin ang item:</span> I-click
                  ang kahit anong produkto sa catalog para makita ang buong deskripsyon at stock.
                </p>
                <p>
                  <span className="font-semibold text-zinc-900">02. I-copy ang inquiry:</span>{' '}
                  Gamitin ang &ldquo;Copy Order Inquiry Message&rdquo; button at i-send ito nang
                  direkta sa owner.
                </p>
                <p>
                  <span className="font-semibold text-zinc-900">03. Confirmation &amp; Delivery:</span>{' '}
                  Available ang same-day courier sa Metro Manila at nationwide shipping.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Tala Goods. All items offered directly by shop owner.</p>
          <div className="flex items-center gap-6">
            <a href="#catalog" className="hover:text-zinc-900 transition-colors">
              Catalog
            </a>
            <a href="#about" className="hover:text-zinc-900 transition-colors">
              About
            </a>
            {isOwner ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="hover:text-zinc-900 transition-colors"
              >
                Owner Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="hover:text-zinc-900 transition-colors"
              >
                Owner Access
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        editingProduct={editingProduct}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
      />

      <ProductDetailModal
        product={detailProduct}
        isOwner={isOwner}
        isSamplePreview={isSampleMode}
        onClose={() => setDetailProduct(null)}
        onEdit={(item) => {
          setEditingProduct(item);
          setIsFormOpen(true);
        }}
        onDelete={(item) => setDeletingProduct(item)}
      />

      <DeleteConfirmModal
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StorefrontApp />
    </ErrorBoundary>
  );
}
