import React, { useState } from 'react';
import {
  X,
  Download,
  BookOpen,
  CheckCircle2,
  Lock,
  Star,
  FileText,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Droplets
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { DigitalProduct } from '../types';

interface DigitalProductReaderModalProps {
  product: DigitalProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateAuthor?: (authorId: string) => void;
}

export const DigitalProductReaderModal: React.FC<DigitalProductReaderModalProps> = ({
  product,
  isOpen,
  onClose,
  onNavigateAuthor
}) => {
  const {
    isProductUnlocked,
    unlockDigitalProduct,
    momentsBalance,
    openTopUpModal,
    currentUser
  } = usePermaculture();

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const isUnlocked = isProductUnlocked(product);

  const handleDownload = () => {
    if (!isUnlocked) {
      const unlocked = unlockDigitalProduct(product.id);
      if (!unlocked) return;
    }

    setDownloadSuccess(true);
    // Instantaneous, clean document download delivery
    const link = document.createElement('a');
    link.href = product.file_url;
    link.download = `${product.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-white dark:bg-[#0c120f] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Top Header Banner with Cover Background */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-neutral-900">
          <img
            src={product.cover_url}
            alt={product.title}
            className="w-full h-full object-cover opacity-40 blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0c120f] via-black/40 to-black/60" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Floating publication specs */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end space-x-4">
            <div className="w-24 sm:w-28 aspect-3/4 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 shrink-0 bg-neutral-900 hidden xs:block">
              <img
                src={product.cover_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 pb-1 text-white">
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="text-stone-300 text-xs">·</span>
                <span className="text-stone-300 text-xs font-mono">{product.file_format}</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white line-clamp-2">
                {product.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {product.subtitle && (
            <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {product.subtitle}
            </p>
          )}

          {/* Author & Stats Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center space-x-3">
              <img
                src={product.creator?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-stone-100">
                  {product.creator?.full_name}
                </div>
                <div className="text-[11px] text-stone-500">
                  {product.creator?.badge || 'Permaculture Educator'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-stone-400 text-[10px]">({product.reviews_count || 12})</span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-1">
                <Download className="h-3.5 w-3.5 text-stone-400" />
                <span>{product.download_count} downloads</span>
              </div>
              <span>·</span>
              <div className="text-[11px] font-mono text-stone-400">{product.file_size}</div>
            </div>
          </div>

          {/* Overview / Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
              Document Overview
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Table of Contents / Outline */}
          {product.table_of_contents && product.table_of_contents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Key Chapters & Technical Plates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {product.table_of_contents.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-medium text-stone-700 dark:text-stone-300 truncate">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Preview Text */}
          {product.sample_preview_text && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-300 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sample Excerpt:</span>
              </div>
              <p className="text-xs text-amber-950 dark:text-amber-200/90 italic leading-relaxed">
                "{product.sample_preview_text}"
              </p>
            </div>
          )}

          {/* Download Notification */}
          {downloadSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>PDF download generated! Check your browser downloads folder.</span>
            </div>
          )}

          {/* Action Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              {isUnlocked ? (
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Permanent Access Unlocked</span>
                </div>
              ) : product.access_type === 'free' ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Free Community Download
                </span>
              ) : product.access_type === 'supporter_only' ? (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  ⭐ Included with Supporter Tier ($5/mo)
                </span>
              ) : (
                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-stone-500">Price:</span>
                  <strong className="text-cyan-700 dark:text-cyan-300 font-extrabold">
                    {product.raindrop_price} Rain Drops 💧
                  </strong>
                  <span className="text-stone-400">(${product.price.toFixed(2)})</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-extrabold shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>
                  {isUnlocked
                    ? 'Download PDF Document'
                    : product.access_type === 'free'
                    ? 'Download Free PDF'
                    : product.access_type === 'supporter_only'
                    ? 'Unlock as Supporter'
                    : `Unlock for ${product.raindrop_price} Drops 💧`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
