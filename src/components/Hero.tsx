import React from 'react';
import { ArrowDownRight } from 'lucide-react';
import { HERO_IMAGE_URL } from '../types/product';

interface HeroProps {
  totalItems: number;
  inStockItems: number;
  isOwner: boolean;
  onAddProduct: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  totalItems,
  inStockItems,
  isOwner,
  onAddProduct,
}) => {
  return (
    <section id="top" className="border-b border-zinc-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[#14532D] mb-4">
                Curated Storefront · Manila, PH
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 leading-[1.1] text-balance mb-5">
                Mga piling produkto na handang bilhin ngayon.
              </h1>
              <p className="text-base text-zinc-600 leading-relaxed max-w-lg mb-8">
                Tingnan ang lahat ng item na aming inooffer—mula sa homeware hanggang sa pang-araw-araw na gamit. Lahat ay may malinaw na presyo, larawan, at stock availability.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-white bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
                >
                  <span>Browse All Items</span>
                  <ArrowDownRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>

                {isOwner && (
                  <button
                    type="button"
                    onClick={onAddProduct}
                    className="inline-flex items-center px-5 py-3 min-h-[44px] text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    + Add New Product
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 mt-8 border-t border-zinc-200">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Active Catalog</p>
                <p className="font-mono-tabular text-2xl font-medium text-zinc-900">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Ready to Ship</p>
                <p className="font-mono-tabular text-2xl font-medium text-zinc-900">
                  {inStockItems} in stock
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative w-full h-72 sm:h-96 lg:h-full min-h-[340px] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80">
              <img
                src={HERO_IMAGE_URL}
                alt="Curated homeware, leather tote, and brass lamp displayed on pale travertine stone"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
