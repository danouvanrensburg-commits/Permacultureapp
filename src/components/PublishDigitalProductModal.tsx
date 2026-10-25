import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FileText,
  Compass,
  Layers,
  Sparkles,
  Download,
  DollarSign,
  Plus,
  CheckCircle2,
  Tag,
  Star,
  Droplets
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { DigitalProduct, DigitalProductType } from '../types';
import { MediaUploadField } from './MediaUploadField';

interface PublishDigitalProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (product: DigitalProduct) => void;
}

const PRODUCT_TYPE_OPTIONS: { type: DigitalProductType; label: string; icon: string; desc: string }[] = [
  { type: 'pdf_book', label: 'eBook / Handbook', icon: '📖', desc: 'In-depth guide, manual, or full publication' },
  { type: 'field_guide', label: 'Field Guide & Key', icon: '🔬', desc: 'Identification charts, microscopy & field checklists' },
  { type: 'schematic_blueprint', label: 'Schematic / Blueprint', icon: '📐', desc: 'CAD drawings, earthwork schematics & construction specs' },
  { type: 'planting_chart', label: 'Planting & Grazing Chart', icon: '🌿', desc: 'Calendars, guild polycultures & rotation wheels' },
  { type: 'cheat_sheet', label: 'Summary Cheat Sheet', icon: '⚡', desc: 'Quick formulas, seed spacing & ratio tables' }
];

export const PublishDigitalProductModal: React.FC<PublishDigitalProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, courseCategories, addCourseCategory, publishDigitalProduct } = usePermaculture();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState(courseCategories[0]?.key || 'Soil Biology');
  const [productType, setProductType] = useState<DigitalProductType>('pdf_book');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  );
  const [fileUrl, setFileUrl] = useState('https://example.com/downloads/permaculture-guide.pdf');
  const [pageCount, setPageCount] = useState<number>(45);
  const [fileSize, setFileSize] = useState('14.2 MB');
  const [accessType, setAccessType] = useState<'one_time' | 'supporter_only' | 'free'>('one_time');
  const [priceUsd, setPriceUsd] = useState<number>(8);
  const [tableOfContentsText, setTableOfContentsText] = useState(
    '1. Foundations & Ecological Principles\n2. Field Techniques & Material Selection\n3. Maintenance & Long-Term Stewardship'
  );
  const [samplePreviewText, setSamplePreviewText] = useState(
    'Chapter 1: The holistic mindset. Understanding natural succession patterns before breaking ground...'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your digital product.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a short description or overview.');
      return;
    }

    const price = accessType === 'free' ? 0 : priceUsd;
    const raindropPrice = accessType === 'free' ? 0 : Math.round(price * 100);

    const toc = tableOfContentsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newProd = publishDigitalProduct({
      creator_id: currentUser.id,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim(),
      product_type: productType,
      category,
      cover_url: coverUrl.trim(),
      file_url: fileUrl.trim(),
      file_format: `PDF · ${pageCount} Pages`,
      file_size: fileSize.trim() || '12.0 MB',
      page_count: Number(pageCount) || 1,
      access_type: accessType,
      price,
      raindrop_price: raindropPrice,
      download_count: 0,
      rating: 5.0,
      reviews_count: 0,
      is_published: true,
      sample_preview_text: samplePreviewText.trim() || undefined,
      table_of_contents: toc.length > 0 ? toc : undefined
    });

    if (onSuccess) {
      onSuccess(newProd);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-white dark:bg-[#0c120f] border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-stone-100">
                Publish Digital Product
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Sell or share downloadable PDFs, books, field guides, and CAD schematics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Type Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
              Publication Format *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRODUCT_TYPE_OPTIONS.map(opt => {
                const isSelected = productType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setProductType(opt.type)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="text-lg mb-1">{opt.icon}</div>
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                Document / Book Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Broadacre Keyline Swale Construction Blueprints"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                Subtitle / Edition Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. Field engineer drawings, overflow spillway calculations & sizing"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category & Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                Domain Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs focus:outline-none focus:border-emerald-500"
              >
                {courseCategories.map(cat => (
                  <option key={cat.key} value={cat.key}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                Page Count
              </label>
              <input
                type="number"
                min={1}
                value={pageCount}
                onChange={e => setPageCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                File Size Label
              </label>
              <input
                type="text"
                placeholder="e.g. 18.5 MB"
                value={fileSize}
                onChange={e => setFileSize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Cover Artwork & PDF Document Uploaders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MediaUploadField
              label="Cover Artwork *"
              type="image"
              value={coverUrl}
              previewAspect="portrait"
              onChange={val => setCoverUrl(val)}
              helperText="Upload a book cover from device or paste an image URL."
              required
            />

            <MediaUploadField
              label="PDF Document *"
              type="pdf"
              value={fileUrl}
              fileSize={fileSize}
              onChange={(val, meta) => {
                setFileUrl(val);
                if (meta?.fileSize) {
                  setFileSize(meta.fileSize);
                }
              }}
              helperText="Upload your PDF file directly or provide a downloadable link."
              required
            />
          </div>

          {/* Pricing Model */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
              Access & Pricing Model *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAccessType('free')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  accessType === 'free'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40 text-stone-600 dark:text-stone-300'
                }`}
              >
                <div className="text-sm font-extrabold">100% Free</div>
                <div className="text-[10px] text-stone-500">Public Download</div>
              </button>

              <button
                type="button"
                onClick={() => setAccessType('supporter_only')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  accessType === 'supporter_only'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40 text-stone-600 dark:text-stone-300'
                }`}
              >
                <div className="text-sm font-extrabold">⭐ Supporter Perk</div>
                <div className="text-[10px] text-stone-500">Guild Subscribers</div>
              </button>

              <button
                type="button"
                onClick={() => setAccessType('one_time')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  accessType === 'one_time'
                    ? 'border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-cyan-500/40 text-stone-600 dark:text-stone-300'
                }`}
              >
                <div className="text-sm font-extrabold">💧 Rain Drops</div>
                <div className="text-[10px] text-stone-500">One-Time Purchase</div>
              </button>
            </div>

            {accessType === 'one_time' && (
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                <span className="font-semibold text-cyan-800 dark:text-cyan-300">Set Price (USD):</span>
                <div className="relative w-28">
                  <span className="absolute left-3 top-2 text-stone-400 font-bold">$</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={priceUsd}
                    onChange={e => setPriceUsd(Number(e.target.value))}
                    className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <span className="text-stone-500 font-mono">
                  = <strong className="text-cyan-600 dark:text-cyan-400">{Math.round(priceUsd * 100).toLocaleString()} Rain Drops 💧</strong>
                </span>
              </div>
            )}
          </div>

          {/* Description & Table of Contents */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
              Overview & Key Takeaways *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explain the field insights, tools, and regenerative frameworks covered in this publication..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
              Table of Contents / Highlights (One line per item)
            </label>
            <textarea
              rows={3}
              value={tableOfContentsText}
              onChange={e => setTableOfContentsText(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-bold cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs shadow-md active:scale-98 cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Publish to Digital Library</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
