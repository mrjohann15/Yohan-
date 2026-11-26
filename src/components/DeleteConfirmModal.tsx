import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { Product } from '../types/product';

interface DeleteConfirmModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: (product: Product) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  product,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm(product);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hindi ma-delete ang produkto.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation"
            className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 id="delete-modal-title" className="font-display text-xl font-semibold text-zinc-900 mb-2">
          I-delete ang produktong ito?
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed mb-5">
          Permanenteng mabubura ang <span className="font-semibold text-zinc-900">{product.name}</span>{' '}
          mula sa iyong live catalog. Hindi na ito mababalik pagkatapos i-delete.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800"
          >
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2.5 min-h-[42px] text-sm font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-lg transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="px-4 py-2.5 min-h-[42px] text-sm font-medium text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
          >
            {deleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
