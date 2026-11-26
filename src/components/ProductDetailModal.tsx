import React, { useState } from 'react';
import { Check, Copy, Package, Pencil, Trash2, X } from 'lucide-react';
import { Product } from '../types/product';
import { formatPhpPrice } from '../lib/imageUtils';

interface ProductDetailModalProps {
  product: Product | null;
  isOwner: boolean;
  isSamplePreview?: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOwner,
  isSamplePreview = false,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  if (!product) return null;

  const handleCopyInquiry = async () => {
    const message = `Hi! Gusto ko sanang mag-inquire tungkol sa "${product.name}" (${formatPhpPrice(product.price)}). Available pa po ba ito?`;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/55 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
    >
      <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-3xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-6 bg-zinc-100 aspect-[4/3] md:aspect-auto md:min-h-[380px] relative">
            {!product.imageUrl || imgFailed ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-zinc-500">
                <Package className="w-10 h-10 mb-2 stroke-[1.5]" aria-hidden="true" />
                <span className="text-sm font-medium text-center">{product.name}</span>
              </div>
            ) : (
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide uppercase text-zinc-500">
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className={product.stock > 0 ? 'text-[#14532D]' : 'text-rose-700'}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Sold Out'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close product details"
                  className="p-2 -mt-2 -mr-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 id="pdp-title" className="font-display text-2xl font-semibold text-zinc-900 mb-2">
                {product.name}
              </h2>

              <p className="font-mono-tabular text-2xl font-medium text-zinc-900 mb-5">
                {formatPhpPrice(product.price)}
              </p>

              <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line mb-6">
                {product.description || 'Walang karagdagang deskripsyon para sa produktong ito.'}
              </p>
            </div>

            <div className="space-y-3 pt-5 border-t border-zinc-200">
              <button
                type="button"
                onClick={handleCopyInquiry}
                disabled={product.stock === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-white bg-[#14532D] hover:bg-[#166534] disabled:bg-zinc-300 disabled:text-zinc-600 rounded-lg transition-colors whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Inquiry Message Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>
                      {product.stock > 0 ? 'Copy Order Inquiry Message' : 'Currently Sold Out'}
                    </span>
                  </>
                )}
              </button>

              {isOwner && !isSamplePreview && (
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(product);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[40px] text-sm font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Pencil className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Edit Item</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDelete(product);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[40px] text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Delete Item</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
