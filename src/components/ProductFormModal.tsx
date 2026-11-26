import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Package, Upload, X } from 'lucide-react';
import {
  DEFAULT_CATEGORIES,
  PRODUCT_CONSTRAINTS,
  Product,
  ProductFormData,
  STUDIO_PRESET_IMAGES,
} from '../types/product';
import { compressImageFile } from '../lib/imageUtils';

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  category: DEFAULT_CATEGORIES[0],
  stock: 1,
  imageUrl: '',
  isPublished: true,
  isFeatured: false,
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  editingProduct,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [priceText, setPriceText] = useState('0');
  const [stockText, setStockText] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        stock: editingProduct.stock,
        imageUrl: editingProduct.imageUrl,
        isPublished: editingProduct.isPublished,
        isFeatured: editingProduct.isFeatured,
      });
      setPriceText(String(editingProduct.price));
      setStockText(String(editingProduct.stock));
    } else {
      setForm(EMPTY_FORM);
      setPriceText('');
      setStockText('1');
    }
    setError(null);
    setPreviewFailed(false);
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setCompressing(true);
    try {
      const compressed = await compressImageFile(file);
      setForm((prev) => ({ ...prev, imageUrl: compressed }));
      setPreviewFailed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hindi ma-upload ang image.');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = Number(priceText);
    const parsedStock = Number(stockText);

    if (form.name.trim().length < PRODUCT_CONSTRAINTS.NAME_MIN) {
      setError('Maglagay ng pangalan ng produkto (hindi bababa sa 2 letra).');
      return;
    }
    if (form.category.trim().length < 1) {
      setError('Maglagay ng kategorya ng produkto.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Maglagay ng tamang presyo (0 pataas).');
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setError('Maglagay ng tamang bilang ng stock (buong numero, 0 pataas).');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        price: parsedPrice,
        stock: parsedStock,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'May error sa pag-save ng produkto. Subukan ulit.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/55 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-2xl my-8 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <h2 id="product-form-title" className="font-display text-xl font-semibold text-zinc-900">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800"
            >
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="prod-name" className="text-sm font-medium text-zinc-900">
                Pangalan ng Produkto *
              </label>
              <span className="text-xs text-zinc-400 font-mono-tabular">
                {form.name.length}/{PRODUCT_CONSTRAINTS.NAME_MAX}
              </span>
            </div>
            <input
              id="prod-name"
              type="text"
              required
              maxLength={PRODUCT_CONSTRAINTS.NAME_MAX}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Hal. Ceramic Vase, Linen Overshirt, Vintage Camera"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#14532D]/15"
            />
          </div>

          {/* Price, Stock, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="prod-price" className="block text-sm font-medium text-zinc-900 mb-1.5">
                Presyo (₱ PHP) *
              </label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                min="0"
                max={PRODUCT_CONSTRAINTS.PRICE_MAX}
                required
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 text-sm font-mono-tabular bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#14532D]/15"
              />
            </div>

            <div>
              <label htmlFor="prod-stock" className="block text-sm font-medium text-zinc-900 mb-1.5">
                Stock Available *
              </label>
              <input
                id="prod-stock"
                type="number"
                step="1"
                min="0"
                max={PRODUCT_CONSTRAINTS.STOCK_MAX}
                required
                value={stockText}
                onChange={(e) => setStockText(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 text-sm font-mono-tabular bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#14532D]/15"
              />
            </div>

            <div>
              <label
                htmlFor="prod-category"
                className="block text-sm font-medium text-zinc-900 mb-1.5"
              >
                Kategorya *
              </label>
              <input
                id="prod-category"
                type="text"
                list="category-suggestions"
                required
                maxLength={PRODUCT_CONSTRAINTS.CATEGORY_MAX}
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Hal. Apparel"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#14532D]/15"
              />
              <datalist id="category-suggestions">
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="prod-desc" className="text-sm font-medium text-zinc-900">
                Deskripsyon ng Produkto
              </label>
              <span className="text-xs text-zinc-400 font-mono-tabular">
                {form.description.length}/{PRODUCT_CONSTRAINTS.DESC_MAX}
              </span>
            </div>
            <textarea
              id="prod-desc"
              rows={3}
              maxLength={PRODUCT_CONSTRAINTS.DESC_MAX}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Ilagay ang sukat, materyales, kondisyon, o iba pang detalye para sa buyers..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#14532D] focus:ring-2 focus:ring-[#14532D]/15"
            />
          </div>

          {/* Image Upload / URL / Studio Preset */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-zinc-900">Larawan ng Produkto</span>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="prod-image-upload"
                />
                <label
                  htmlFor="prod-image-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{compressing ? 'Naglo-load...' : 'Upload Photo'}</span>
                </label>
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, imageUrl: '' }));
                      setPreviewFailed(false);
                    }}
                    className="px-2.5 py-1.5 min-h-[36px] text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4 aspect-[4/3] rounded-lg overflow-hidden bg-zinc-200/70 border border-zinc-200 flex items-center justify-center">
                {form.imageUrl && !previewFailed ? (
                  <img
                    src={form.imageUrl}
                    alt="Product preview"
                    referrerPolicy="no-referrer"
                    onError={() => setPreviewFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-zinc-400 p-2 text-center">
                    <Package className="w-6 h-6 mb-1" aria-hidden="true" />
                    <span className="text-[11px]">Walang larawan</span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-8 space-y-2.5">
                <div>
                  <label htmlFor="prod-img-url" className="block text-xs text-zinc-600 mb-1">
                    O mag-paste ng Image URL
                  </label>
                  <input
                    id="prod-img-url"
                    type="text"
                    value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, imageUrl: e.target.value }));
                      setPreviewFailed(false);
                    }}
                    placeholder={
                      form.imageUrl.startsWith('data:')
                        ? 'Uploaded local image attached'
                        : 'https://example.com/photo.jpg'
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#14532D]"
                  />
                </div>

                <div>
                  <p className="text-xs text-zinc-600 mb-1.5 flex items-center gap-1">
                    <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Studio sample photos:</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {STUDIO_PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, imageUrl: preset.url }));
                          setPreviewFailed(false);
                        }}
                        className={`px-2 py-1 text-[11px] font-medium rounded-md border transition-colors whitespace-nowrap ${
                          form.imageUrl === preset.url
                            ? 'bg-[#14532D] text-white border-[#14532D]'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visibility & Featured Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#14532D] focus:ring-[#14532D]"
              />
              <div>
                <span className="block text-sm font-medium text-zinc-900">Visible to Buyers</span>
                <span className="block text-xs text-zinc-500">
                  Ipakita sa public storefront catalog
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#14532D] focus:ring-[#14532D]"
              />
              <div>
                <span className="block text-sm font-medium text-zinc-900">Featured Item</span>
                <span className="block text-xs text-zinc-500">
                  I-highlight sa Featured collection
                </span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 min-h-[42px] text-sm font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-lg transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || compressing}
              className="px-5 py-2.5 min-h-[42px] text-sm font-medium text-white bg-[#14532D] hover:bg-[#166534] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
            >
              {submitting
                ? 'Saving...'
                : editingProduct
                  ? 'Save Changes'
                  : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
