import React from 'react';
import { Plus, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  isOwner: boolean;
  authLoading: boolean;
  onOwnerSignIn: () => void;
  onAddProduct: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOwner,
  authLoading,
  onOwnerSignIn,
  onAddProduct,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F8F9FA]/95 backdrop-blur-sm border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark only */}
        <a
          href="#top"
          className="font-display text-xl font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0"
        >
          Tala Goods
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
        >
          <a
            href="#catalog"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Catalog
          </a>
          <a
            href="#featured"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Featured
          </a>
          <a
            href="#about"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            About Shop
          </a>
          <a
            href="#order-guide"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            How to Order
          </a>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          {isOwner ? (
            <button
              type="button"
              onClick={onAddProduct}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Add Product</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={authLoading}
              onClick={onOwnerSignIn}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{authLoading ? 'Checking...' : 'Owner Sign In'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
