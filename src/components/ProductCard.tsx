import React, { useState } from 'react';
import { Package, Pencil, Trash2 } from 'lucide-react';
import { Product } from '../types/product';
import { formatPhpPrice } from '../lib/imageUtils';

interface ProductCardProps {
  product: Product;
  isOwner: boolean;
  isSamplePreview?: boolean;
  onSelect: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isOwner,
  isSamplePreview = false,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showFallback = !product.imageUrl || imgFailed;

  return (
    <article className="group bg-white border border-zinc-200/85 rounded-xl overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="text-left flex-1 flex flex-col focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#14532D]"
      >
        <div className="relative w-full aspect-[4/3] bg-zinc-100 overflow-hidden border-b border-zinc-100">
          {showFallback ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-100 to-zinc-200/70 text-zinc-500">
              <Package className="w-8 h-8 mb-2 stroke-[1.5]" aria-hidden="true" />
              <span className="text-xs font-medium text-center line-clamp-2 text-zinc-600">
                {product.name}
              </span>
            </div>
          ) : (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col w-full">
          {/* Clean unboxed metadata with typographic separators (no pills) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium tracking-wide uppercase text-zinc-500 mb-2">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className={product.stock > 0 ? 'text-[#14532D]' : 'text-rose-700'}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Sold Out'}
            </span>
            {!product.isPublished && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700">Draft</span>
              </>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-base font-semibold text-zinc-900 leading-snug line-clamp-2">
              {product.name}
            </h3>
            <span className="font-mono-tabular text-[15px] font-medium text-zinc-900 whitespace-nowrap shrink-0">
              {formatPhpPrice(product.price)}
            </span>
          </div>

          <p className="text-sm text-zinc-600 leading-relaxed line-clamp-2 mt-auto">
            {product.description || 'Walang karagdagang deskripsyon.'}
          </p>
        </div>
      </button>

      {isOwner && !isSamplePreview && (
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-zinc-800 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-colors whitespace-nowrap"
          >
            <Pencil className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-rose-700 bg-white border border-zinc-200 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </article>
  );
};
