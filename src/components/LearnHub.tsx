import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Droplets,
  Lock,
  Play,
  CheckCircle2,
  Users,
  Clock,
  FileText,
  Filter,
  ArrowRight,
  Edit3,
  Star,
  Tag,
  Download,
  Compass,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { Course, CourseCategoryMeta, DigitalProduct, DigitalProductType } from '../types';
import { PublishDigitalProductModal } from './PublishDigitalProductModal';
import { DigitalProductReaderModal } from './DigitalProductReaderModal';

interface LearnHubProps {
  navigate: (route: string) => void;
}

export const LearnHub: React.FC<LearnHubProps> = ({ navigate }) => {
  const {
    courses,
    currentUser,
    enrolledCourseIds,
    isCourseUnlocked,
    getCourseReviews,
    courseCategories,
    digitalProducts,
    unlockedProductIds,
    isProductUnlocked,
    unlockDigitalProduct
  } = usePermaculture();

  // Mode Switcher: Video Courses vs Digital Publications
  const [learnView, setLearnView] = useState<'courses' | 'digital_products'>('courses');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | DigitalProductType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedProductForReader, setSelectedProductForReader] = useState<DigitalProduct | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);

  // Dynamically assemble categories (All + core + custom community categories)
  const allCategories: CourseCategoryMeta[] = useMemo(() => [
    {
      key: 'All',
      label: learnView === 'courses' ? 'All Courses' : 'All Digital Publications',
      icon: '🌱',
      description: learnView === 'courses' ? 'Complete regenerative curriculum' : 'All downloadable books, guides & blueprints'
    },
    ...courseCategories
  ], [courseCategories, learnView]);

  // Filter published courses vs user's draft courses
  const myDrafts = courses.filter(c => c.creator_id === currentUser.id && !c.is_published);

  const filteredCourses = courses.filter(c => {
    // Only show published courses in the public catalog
    if (!c.is_published) return false;
    if (selectedCategory !== 'All' && c.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchAuthor = c.creator?.full_name.toLowerCase().includes(q);
      const matchCategory = c.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAuthor && !matchCategory) return false;
    }
    return true;
  });

  const filteredDigitalProducts = digitalProducts.filter(p => {
    if (!p.is_published) return false;
    if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (productTypeFilter !== 'all' && p.product_type !== productTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSubtitle = p.subtitle?.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchAuthor = p.creator?.full_name.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      if (!matchTitle && !matchSubtitle && !matchDesc && !matchAuthor && !matchCategory) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#070b09] text-stone-900 dark:text-stone-100 py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ============================================================ */}
        {/* LEARN HUB TOP MODE SWITCHER                                  */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex p-1 rounded-2xl bg-[#ECE6DD] dark:bg-stone-900 border border-[#DDD5C9] dark:border-stone-800 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setLearnView('courses');
                setSelectedCategory('All');
              }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                learnView === 'courses'
                  ? 'bg-white dark:bg-[#0f1714] text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Video Masterclasses ({courses.filter(c => c.is_published).length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLearnView('digital_products');
                setSelectedCategory('All');
              }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                learnView === 'digital_products'
                  ? 'bg-white dark:bg-[#0f1714] text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Digital Library & Books ({digitalProducts.filter(p => p.is_published).length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {learnView === 'courses' ? (
              <button
                type="button"
                onClick={() => navigate('learn/create')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Course</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Publish Book / PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* TOP HERO BANNER & CTA                                        */}
        {/* ============================================================ */}
        <div className="relative rounded-3xl overflow-hidden border border-[#E7E1D8] dark:border-stone-800 shadow-lg text-white group">
          <img
            src={
              learnView === 'courses'
                ? '/src/assets/images/hero_keyline_water_harvest_1792051975745.jpg'
                : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80'
            }
            alt="Permaculture Learning"
            className="w-full h-64 sm:h-80 object-cover transition-transform duration-700 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/70 to-stone-950/40 flex flex-col justify-between p-6 sm:p-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs font-semibold backdrop-blur-md">
                {learnView === 'courses' ? <GraduationCap className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                <span>
                  {learnView === 'courses'
                    ? 'Permaculture Academy & LMS'
                    : 'Digital Library & Schematics Marketplace'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                {learnView === 'courses'
                  ? 'Regenerative Mastery & Practical Earth Skills'
                  : 'Downloadable Books, Field Guides & Schematics'}
              </h1>
              <p className="text-stone-200 text-xs sm:text-sm leading-relaxed max-w-xl">
                {learnView === 'courses'
                  ? 'Step-by-step masterclasses with video tutorials, downloadable engineering schematics, and field checklists taught by experienced earth stewards.'
                  : 'High-resolution PDF handbooks, soil biology microscopy guides, CAD earthwork drawings, and holistic grazing calendars published directly by educators.'}
              </p>
            </div>

            {/* Banner bottom details & action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-white/15">
              <div className="flex items-center space-x-3 text-xs text-stone-300">
                <span>🌱 {allCategories.length - 1} Curriculums & Domains</span>
                <span>·</span>
                <span>⭐ Verified Steward Reviews</span>
                <span>·</span>
                <span>💧 Instant Rain Drops Checkout</span>
              </div>

              {learnView === 'courses' ? (
                <button
                  type="button"
                  onClick={() => navigate('learn/create')}
                  className="flex items-center justify-center space-x-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer group"
                >
                  <Plus className="h-5 w-5 stroke-[2.5] group-hover:rotate-90 transition-transform" />
                  <span>Create Your Own Course</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(true)}
                  className="flex items-center justify-center space-x-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer group"
                >
                  <Plus className="h-5 w-5 stroke-[2.5] group-hover:rotate-90 transition-transform" />
                  <span>Publish Book or PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CREATOR DRAFTS BANNER (If creator has unpublished drafts)    */}
        {/* ============================================================ */}
        {myDrafts.length > 0 && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100">
                  You have {myDrafts.length} unpublished course draft{myDrafts.length > 1 ? 's' : ''}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Continue building your curriculum, upload videos/PDFs, and publish when ready.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {myDrafts.map(d => (
                <button
                  key={d.id}
                  onClick={() => navigate(`learn/edit/${d.id}`)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-sm cursor-pointer truncate max-w-[180px]"
                >
                  Edit "{d.title}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* COURSE CATEGORIES & SEARCH FILTER                            */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Explore Categories</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Filter courses by regenerative domain
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search courses, instructors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-[#F4EFEA] dark:bg-stone-800 border border-[#E7E1D8] dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Category Tabs: All + Core + Custom Community Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {allCategories.map(cat => {
              const isSelected = selectedCategory.toLowerCase() === cat.key.toLowerCase();
              const count = learnView === 'courses'
                ? (cat.key === 'All' ? courses.filter(c => c.is_published).length : courses.filter(c => c.is_published && c.category.toLowerCase() === cat.key.toLowerCase()).length)
                : (cat.key === 'All' ? digitalProducts.filter(p => p.is_published).length : digitalProducts.filter(p => p.is_published && p.category.toLowerCase() === cat.key.toLowerCase()).length);

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex flex-col p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-100/70 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500 text-emerald-950 dark:text-emerald-300 font-bold shadow-2xs'
                      : 'bg-white dark:bg-[#0f1714] border-[#E7E1D8] dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-600/40 hover:bg-[#F4EFEA] dark:hover:bg-[#15231e]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-base shrink-0">{cat.icon}</span>
                      <span className="text-xs font-bold truncate">{cat.label}</span>
                    </div>
                    {count > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-300'
                            : 'bg-neutral-100 dark:bg-stone-800 text-stone-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">
                    {cat.description}
                  </span>
                  {cat.isCustom && (
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      Community Added
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: VIDEO MASTERCLASSES & COURSES GRID                   */}
        {/* ============================================================ */}
        {learnView === 'courses' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
                <span>Showing {filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'}</span>
                {selectedCategory !== 'All' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono">
                    #{selectedCategory}
                  </span>
                )}
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#E7E1D8] dark:border-stone-800 p-12 text-center space-y-3 bg-white/50 dark:bg-neutral-900/40">
                <GraduationCap className="h-10 w-10 text-stone-400 mx-auto" />
                <h3 className="font-bold text-sm">No courses found matching this criteria</h3>
                <p className="text-xs text-stone-500">
                  Try selecting "All Courses" or search for a different permaculture topic.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-xs font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => {
                  const isUnlocked = isCourseUnlocked(course);
                  const isEnrolled = enrolledCourseIds.includes(course.id);
                  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);

                  return (
                    <div
                      key={course.id}
                      onClick={() => navigate(`learn/${course.id}`)}
                      className="group rounded-3xl bg-white dark:bg-[#0f1714] border border-[#E7E1D8] dark:border-stone-800 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col hover:border-emerald-600/50"
                    >
                      {/* Thumbnail Banner */}
                      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        {/* Category Badge - Clickable to filter */}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedCategory(course.category);
                          }}
                          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-stone-950 transition-colors cursor-pointer"
                          title={`Filter by ${course.category}`}
                        >
                          {course.category}
                        </button>

                        {/* Access / Price Tag */}
                        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5">
                          {course.access_type === 'free' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500 text-stone-950 shadow-sm">
                              FREE
                            </span>
                          ) : course.access_type === 'supporter_only' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-stone-950 shadow-sm flex items-center space-x-1">
                              <span>⭐</span>
                              <span>SUPPORTER ONLY</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-cyan-500 text-stone-950 shadow-sm flex items-center space-x-1">
                              <span>💧</span>
                              <span>{Math.round(course.price * 100)} Drops (${course.price.toFixed(2)})</span>
                            </span>
                          )}
                        </div>

                        {/* Status / Unlocked Pill */}
                        {isUnlocked && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-stone-950 flex items-center space-x-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{isEnrolled ? 'Enrolled' : 'Unlocked'}</span>
                          </span>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-base text-neutral-900 dark:text-stone-100 group-hover:text-emerald-500 transition-colors line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                          {/* Instructor */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <img
                                src={course.creator?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                                alt=""
                                className="h-6 w-6 rounded-full object-cover ring-1 ring-emerald-500/40"
                              />
                              <span className="font-semibold text-neutral-800 dark:text-stone-200 truncate max-w-[140px]">
                                {course.creator?.full_name}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1 text-stone-400 text-[11px]">
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>{totalLessons} Lessons</span>
                            </div>
                          </div>

                          {/* Card CTA & Reviews rating */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline flex items-center space-x-1">
                              <span>{isUnlocked ? 'Start Learning' : 'View Curriculum'}</span>
                              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>

                            <div className="flex items-center space-x-1 text-xs">
                              {(() => {
                                const courseReviews = getCourseReviews(course.id);
                                const avg = courseReviews.length > 0
                                  ? courseReviews.reduce((a, r) => a + r.rating, 0) / courseReviews.length
                                  : 5.0;
                                return (
                                  <div className="flex items-center space-x-1 text-amber-500 font-bold">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                                    <span className="font-mono text-[11px]">{avg.toFixed(1)}</span>
                                    <span className="text-[10px] text-stone-400 font-mono font-normal">
                                      ({courseReviews.length})
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ============================================================ */
          /* VIEW 2: DIGITAL LIBRARY & PUBLICATIONS MARKETPLACE           */
          /* ============================================================ */
          <div className="space-y-6">
            {/* Format Sub-Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { type: 'all', label: 'All Formats', icon: '📚' },
                  { type: 'pdf_book', label: 'eBooks & Books', icon: '📖' },
                  { type: 'field_guide', label: 'Field Guides & Keys', icon: '🔬' },
                  { type: 'schematic_blueprint', label: 'Blueprints & CAD', icon: '📐' },
                  { type: 'planting_chart', label: 'Planting & Grazing Charts', icon: '🌿' }
                ].map(f => {
                  const isSelected = productTypeFilter === f.type;
                  return (
                    <button
                      key={f.type}
                      type="button"
                      onClick={() => setProductTypeFilter(f.type as any)}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-[#0f1714] border border-[#E7E1D8] dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-600/40'
                      }`}
                    >
                      <span>{f.icon}</span>
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2 text-xs font-semibold text-stone-500">
                <span>Showing {filteredDigitalProducts.length} publication{filteredDigitalProducts.length === 1 ? '' : 's'}</span>
                {selectedCategory !== 'All' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono">
                    #{selectedCategory}
                  </span>
                )}
              </div>
            </div>

            {filteredDigitalProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#E7E1D8] dark:border-stone-800 p-12 text-center space-y-3 bg-white/50 dark:bg-neutral-900/40">
                <BookOpen className="h-10 w-10 text-stone-400 mx-auto" />
                <h3 className="font-bold text-sm">No digital publications found</h3>
                <p className="text-xs text-stone-500">
                  Try clearing your search query or selecting a different category or format.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setProductTypeFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-xs font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDigitalProducts.map(prod => {
                  const unlocked = isProductUnlocked(prod);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setSelectedProductForReader(prod);
                        setIsReaderModalOpen(true);
                      }}
                      className="group rounded-3xl bg-white dark:bg-[#0f1714] border border-[#E7E1D8] dark:border-stone-800 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col hover:border-emerald-600/50"
                    >
                      {/* Document Cover Aspect Frame */}
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-900">
                        <img
                          src={prod.cover_url}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                        {/* Category & Format Badges */}
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedCategory(prod.category);
                            }}
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-stone-950 transition-colors cursor-pointer"
                          >
                            {prod.category}
                          </button>
                        </div>

                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-black/60 backdrop-blur-md text-stone-200 border border-white/20">
                          {prod.file_format}
                        </span>

                        {/* Price / Access Pill */}
                        <div className="absolute bottom-3 left-3">
                          {prod.access_type === 'free' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500 text-stone-950 shadow-sm">
                              FREE DOWNLOAD
                            </span>
                          ) : prod.access_type === 'supporter_only' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-stone-950 shadow-sm flex items-center space-x-1">
                              <span>⭐</span>
                              <span>SUPPORTER PERK</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-cyan-500 text-stone-950 shadow-sm flex items-center space-x-1">
                              <span>💧</span>
                              <span>{prod.raindrop_price} Drops (${prod.price.toFixed(2)})</span>
                            </span>
                          )}
                        </div>

                        {/* Unlocked status */}
                        {unlocked && (
                          <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-stone-950 flex items-center space-x-1 shadow-sm">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Unlocked</span>
                          </span>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-base text-neutral-900 dark:text-stone-100 group-hover:text-emerald-500 transition-colors line-clamp-2">
                            {prod.title}
                          </h3>
                          {prod.subtitle && (
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 line-clamp-1">
                              {prod.subtitle}
                            </p>
                          )}
                          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                          {/* Author & File Stats */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <img
                                src={prod.creator?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                                alt=""
                                className="h-6 w-6 rounded-full object-cover ring-1 ring-emerald-500/40"
                              />
                              <span className="font-semibold text-neutral-800 dark:text-stone-200 truncate max-w-[140px]">
                                {prod.creator?.full_name}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 text-[11px] text-stone-400 font-mono">
                              <span>{prod.file_size}</span>
                              <span>·</span>
                              <span>{prod.download_count} DL</span>
                            </div>
                          </div>

                          {/* Action CTA & Rating */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline flex items-center space-x-1">
                              <span>{unlocked ? 'Download & View PDF' : 'Sample & Unlock'}</span>
                              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>

                            <div className="flex items-center space-x-1 text-xs">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                              <span className="font-mono text-[11px] text-amber-500 font-bold">{prod.rating.toFixed(1)}</span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                ({prod.reviews_count || 12})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <PublishDigitalProductModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
        />

        <DigitalProductReaderModal
          isOpen={isReaderModalOpen}
          product={selectedProductForReader}
          onClose={() => {
            setIsReaderModalOpen(false);
            setSelectedProductForReader(null);
          }}
        />
      </div>
    </div>
  );
};
