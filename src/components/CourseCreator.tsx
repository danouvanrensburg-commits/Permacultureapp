import React, { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Globe,
  Lock,
  Video,
  FileText,
  Image as ImageIcon,
  Eye,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Upload,
  Tag,
  X
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { Course, CourseSection, CourseLesson, CourseAccessType, CourseCategory, CourseCategoryMeta, CoursePdfDocument } from '../types';
import { MediaUploadField } from './MediaUploadField';

interface CourseCreatorProps {
  navigate: (route: string) => void;
  existingCourseId?: string;
}

export const CourseCreator: React.FC<CourseCreatorProps> = ({ navigate, existingCourseId }) => {
  const { courses, createCourse, updateCourse, currentUser, courseCategories, addCourseCategory } = usePermaculture();

  const existingCourse = existingCourseId ? courses.find(c => c.id === existingCourseId) : null;

  // Form State
  const [title, setTitle] = useState(existingCourse?.title || '');
  const [description, setDescription] = useState(existingCourse?.description || '');
  const [category, setCategory] = useState<string>(existingCourse?.category || 'Water Harvesting');
  const [price, setPrice] = useState<number>(existingCourse?.price || 15);
  const [accessType, setAccessType] = useState<CourseAccessType>(existingCourse?.access_type || 'one_time');
  const [thumbnailUrl, setThumbnailUrl] = useState(
    existingCourse?.thumbnail_url ||
      'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1200&q=80'
  );
  const [overviewPdfs, setOverviewPdfs] = useState<CoursePdfDocument[]>(existingCourse?.overview_pdfs || []);
  const [isPublished, setIsPublished] = useState<boolean>(existingCourse?.is_published || false);

  // Custom Category Modal State
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🌿');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Curriculum Sections & Lessons
  const [sections, setSections] = useState<CourseSection[]>(
    existingCourse?.sections || [
      {
        id: `sec_${Date.now()}_1`,
        course_id: '',
        title: 'Section 1: Foundations & Core Principles',
        order_index: 0,
        lessons: [
          {
            id: `les_${Date.now()}_1`,
            section_id: `sec_${Date.now()}_1`,
            title: 'Lesson 1: Introduction & Overview',
            order_index: 0,
            iframe_video_url: 'https://www.youtube.com/embed/8gPNz6Uky4w',
            content_text: 'Welcome to this regenerative course module. Here we introduce the key objectives and equipment needed.',
            pdf_urls: [],
            image_urls: [],
            is_free_preview: true,
            duration_minutes: 15
          }
        ]
      }
    ]
  );

  const [activeLessonId, setActiveLessonId] = useState<string>(sections[0]?.lessons[0]?.id || '');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleCreateCustomCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryError('Please enter a category name');
      return;
    }
    if (trimmed.length < 3) {
      setCategoryError('Category name must be at least 3 characters');
      return;
    }

    const created = addCourseCategory({
      name: trimmed,
      icon: newCategoryIcon.trim() || '🌿',
      description: newCategoryDescription.trim() || `Regenerative practices and techniques in ${trimmed}`
    });

    setCategory(created.key);
    setIsAddCategoryOpen(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryIcon('🌿');
    setCategoryError(null);
    showNotice(`Category "${created.label}" created & selected!`);
  };

  // Section Handlers
  const handleAddSection = () => {
    const newSecId = `sec_${Date.now()}_${sections.length + 1}`;
    const newSec: CourseSection = {
      id: newSecId,
      course_id: existingCourse?.id || '',
      title: `Section ${sections.length + 1}: Practical Application`,
      order_index: sections.length,
      lessons: [
        {
          id: `les_${Date.now()}_new`,
          section_id: newSecId,
          title: 'New Lesson',
          order_index: 0,
          iframe_video_url: '',
          content_text: '',
          pdf_urls: [],
          image_urls: [],
          is_free_preview: false,
          duration_minutes: 10
        }
      ]
    };
    setSections(prev => [...prev, newSec]);
    setActiveLessonId(newSec.lessons[0].id);
    showNotice('Added new section to curriculum');
  };

  const handleUpdateSectionTitle = (secId: string, newTitle: string) => {
    setSections(prev => prev.map(s => (s.id === secId ? { ...s, title: newTitle } : s)));
  };

  const handleDeleteSection = (secId: string) => {
    if (sections.length <= 1) {
      showNotice('Course must have at least one section');
      return;
    }
    setSections(prev => prev.filter(s => s.id !== secId));
    showNotice('Section removed');
  };

  // Lesson Handlers
  const handleAddLesson = (secId: string) => {
    const newLesId = `les_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setSections(prev =>
      prev.map(s => {
        if (s.id === secId) {
          const newLesson: CourseLesson = {
            id: newLesId,
            section_id: secId,
            title: `Lesson ${s.lessons.length + 1}`,
            order_index: s.lessons.length,
            iframe_video_url: '',
            content_text: '',
            pdf_urls: [],
            image_urls: [],
            is_free_preview: false,
            duration_minutes: 15
          };
          return { ...s, lessons: [...s.lessons, newLesson] };
        }
        return s;
      })
    );
    setActiveLessonId(newLesId);
  };

  const handleUpdateLesson = (lessonId: string, updates: Partial<CourseLesson>) => {
    setSections(prev =>
      prev.map(s => ({
        ...s,
        lessons: s.lessons.map(l => (l.id === lessonId ? { ...l, ...updates } : l))
      }))
    );
  };

  const handleDeleteLesson = (lessonId: string) => {
    setSections(prev =>
      prev.map(s => ({
        ...s,
        lessons: s.lessons.filter(l => l.id !== lessonId)
      }))
    );
  };

  // Save / Publish
  const handleSave = (publishState: boolean) => {
    if (!title.trim()) {
      showNotice('Please enter a course title');
      return;
    }

    const courseData: Omit<Course, 'id' | 'created_at'> = {
      title: title.trim(),
      description: description.trim(),
      creator_id: currentUser.id,
      category,
      price: accessType === 'free' ? 0 : Number(price) || 0,
      access_type: accessType,
      is_published: publishState,
      thumbnail_url: thumbnailUrl.trim(),
      overview_pdfs: overviewPdfs,
      sections
    };

    if (existingCourse) {
      updateCourse(existingCourse.id, courseData);
      showNotice(publishState ? 'Course published successfully!' : 'Draft saved!');
    } else {
      const created = createCourse(courseData);
      showNotice(publishState ? 'Course published!' : 'Draft created!');
      navigate(`learn/${created.id}`);
      return;
    }

    navigate('learn');
  };

  // Currently active lesson being edited
  let activeLesson: CourseLesson | undefined;
  for (const s of sections) {
    const found = s.lessons.find(l => l.id === activeLessonId);
    if (found) {
      activeLesson = found;
      break;
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#070b09] text-stone-900 dark:text-stone-100 py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Floating Toast Notice */}
        {notice && (
          <div className="fixed top-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#0f1714] border border-emerald-500 shadow-2xl text-xs font-semibold animate-in slide-in-from-top">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>{notice}</span>
          </div>
        )}

        {/* Top Header & Save/Publish Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E1D8] dark:border-stone-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('learn')}
              className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-stone-600 dark:text-stone-300 hover:text-emerald-500 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {existingCourse ? 'Course Builder & Editor' : 'Create New Permaculture Course'}
              </h1>
              <p className="text-xs text-stone-500">
                Craft video lessons, downloadable schematics, and set supporter access.
              </p>
            </div>
          </div>

          {/* Action Buttons: Save Draft vs Publish */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Publish Toggle Switch */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold">
              <span className={isPublished ? 'text-emerald-500' : 'text-amber-500'}>
                {isPublished ? '● Published' : '○ Draft'}
              </span>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  isPublished ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    isPublished ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 text-xs font-bold cursor-pointer transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-stone-950 text-xs font-extrabold shadow-md hover:brightness-110 active:scale-98 cursor-pointer transition-all"
            >
              <Globe className="h-4 w-4" />
              <span>Publish Course</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* COURSE METADATA & ACCESS SETTINGS                            */}
        {/* ============================================================ */}
        <div className="rounded-3xl bg-white dark:bg-[#0f1714] border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-neutral-900 dark:text-stone-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            Course Overview & Access Setup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
                Course Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Masterclass in Keyline Water Harvesting"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
                  Permaculture Category *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryError(null);
                    setIsAddCategoryOpen(true);
                  }}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Custom Category</span>
                </button>
              </div>

              <select
                value={category}
                onChange={e => {
                  if (e.target.value === '__add_custom__') {
                    setCategoryError(null);
                    setIsAddCategoryOpen(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <optgroup label="Available Categories">
                  {courseCategories.map(cat => (
                    <option key={cat.key} value={cat.key}>
                      {cat.icon} {cat.label} {cat.isCustom ? '(Community)' : ''}
                    </option>
                  ))}
                </optgroup>
                <option value="__add_custom__" className="font-bold text-emerald-600">
                  + Create New Category...
                </option>
              </select>

              {/* Category preview pill */}
              {(() => {
                const currentMeta = courseCategories.find(c => c.key.toLowerCase() === category.toLowerCase());
                return (
                  <div className="flex items-center space-x-2 pt-1 text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="text-base">{currentMeta?.icon || '🌿'}</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{currentMeta?.label || category}</span>
                    {currentMeta?.description && (
                      <span className="truncate max-w-[280px]">· {currentMeta.description}</span>
                    )}
                    {currentMeta?.isCustom && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium shrink-0">
                        Community Added
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
                Course Summary & What Students Will Learn
              </label>
              <textarea
                rows={3}
                placeholder="Provide a compelling overview of the skills, field techniques, and design philosophies covered in this masterclass..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Thumbnail Artwork Uploader */}
            <div className="space-y-1.5 md:col-span-2">
              <MediaUploadField
                label="Course Thumbnail Artwork *"
                type="image"
                value={thumbnailUrl}
                previewAspect="video"
                onChange={val => setThumbnailUrl(val)}
                helperText="Upload course cover artwork from your computer/phone or enter an image URL."
                required
              />
            </div>

            {/* Course Overview Downloadable PDF Documents */}
            <div className="space-y-2 md:col-span-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Course Overview & Downloadable Syllabus / Schematics (PDF)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Supplemental PDFs available to enrolled students across the entire curriculum.
                  </p>
                </div>
              </div>

              {overviewPdfs.length > 0 && (
                <div className="space-y-1.5">
                  {overviewPdfs.map((pdf, idx) => (
                    <div
                      key={pdf.id || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-neutral-800 dark:text-stone-200 truncate">{pdf.name}</span>
                        {pdf.size && <span className="text-[10px] text-stone-400 font-mono">({pdf.size})</span>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-400 hover:text-emerald-500 p-1"
                          title="Preview document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setOverviewPdfs(prev => prev.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-red-500 p-1 cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <MediaUploadField
                label="Add Course Overview PDF"
                type="pdf"
                value=""
                onChange={(val, meta) => {
                  if (val) {
                    const newDoc: CoursePdfDocument = {
                      id: `doc_${Date.now()}`,
                      name: meta?.fileName || 'Course Overview Guide.pdf',
                      url: val,
                      size: meta?.fileSize || 'PDF Document',
                      uploaded_at: new Date().toISOString()
                    };
                    setOverviewPdfs(prev => [...prev, newDoc]);
                    showNotice(`Added "${newDoc.name}" to course downloads`);
                  }
                }}
                helperText="Upload general reference materials (e.g., equipment checklist, contour elevation tables)."
              />
            </div>

            {/* Access Type & Pricing */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
                Access Type & Price
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAccessType('one_time')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    accessType === 'one_time'
                      ? 'border-cyan-500 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                      : 'border-neutral-200 dark:border-neutral-800 text-stone-500'
                  }`}
                >
                  💧 One-Time ($)
                </button>
                <button
                  type="button"
                  onClick={() => setAccessType('supporter_only')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    accessType === 'supporter_only'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'border-neutral-200 dark:border-neutral-800 text-stone-500'
                  }`}
                >
                  ⭐ Supporter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccessType('free');
                    setPrice(0);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    accessType === 'free'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'border-neutral-200 dark:border-neutral-800 text-stone-500'
                  }`}
                >
                  Free Open Source
                </button>
              </div>

              {accessType === 'one_time' && (
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-xs font-bold text-stone-500">$ USD:</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-mono font-bold"
                  />
                  <span className="text-[11px] text-cyan-500 font-mono">
                    = {Math.round(price * 100)} Rain Drops 💧 (100 Drops = $1.00)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CURRICULUM BUILDER: SECTIONS & LESSONS                       */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Tree: Sections & Lessons List */}
          <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#0f1714] border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm">Curriculum Outline</h3>
              <button
                type="button"
                onClick={handleAddSection}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {sections.map((sec, sIdx) => (
                <div
                  key={sec.id}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={sec.title}
                      onChange={e => handleUpdateSectionTitle(sec.id, e.target.value)}
                      className="font-bold text-xs bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 px-1 py-0.5 flex-1 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(sec.id)}
                      className="text-stone-400 hover:text-red-500 p-1 rounded cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Lessons */}
                  <div className="space-y-1 pl-2">
                    {sec.lessons.map(les => {
                      const isActive = les.id === activeLessonId;
                      return (
                        <div
                          key={les.id}
                          onClick={() => setActiveLessonId(les.id)}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/40'
                              : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate flex-1">
                            <Video className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            <span className="truncate">{les.title}</span>
                          </div>
                          {les.is_free_preview && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                              Preview
                            </span>
                          )}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleAddLesson(sec.id)}
                      className="w-full text-left py-1.5 px-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Lesson to this section</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Editor: Active Lesson Content & Video Embed */}
          <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#0f1714] border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-5 shadow-xs">
            {activeLesson ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <h3 className="font-bold text-sm">Editing Lesson: {activeLesson.title}</h3>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeLesson.is_free_preview}
                        onChange={e =>
                          handleUpdateLesson(activeLesson!.id, { is_free_preview: e.target.checked })
                        }
                        className="rounded accent-emerald-500"
                      />
                      <span>Allow Free Preview</span>
                    </label>
                  </div>
                </div>

                {/* Lesson Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={activeLesson.title}
                    onChange={e => handleUpdateLesson(activeLesson!.id, { title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Video iFrame Embed URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center space-x-1">
                      <Video className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Video Embed URL (YouTube / Vimeo / Loom iFrame)</span>
                    </label>
                    <span className="text-[10px] text-stone-400">e.g. https://www.youtube.com/embed/...</span>
                  </div>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    value={activeLesson.iframe_video_url || ''}
                    onChange={e =>
                      handleUpdateLesson(activeLesson!.id, { iframe_video_url: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Live iFrame Preview if entered */}
                {activeLesson.iframe_video_url && (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-neutral-200 dark:border-neutral-800">
                    <iframe
                      src={activeLesson.iframe_video_url}
                      title="Lesson Video Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                )}

                {/* Lesson Content Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
                    Written Lesson Description & Practical Instructions
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Provide in-depth step-by-step instructions, botanical references, soil moisture formulas, or safety notes..."
                    value={activeLesson.content_text || ''}
                    onChange={e =>
                      handleUpdateLesson(activeLesson!.id, { content_text: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                {/* Attachments: Lesson PDF Schematics & Guides */}
                <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center space-x-1.5">
                      <FileText className="h-4 w-4 text-red-500" />
                      <span>Lesson Downloadable PDFs & Schematics</span>
                    </label>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {((activeLesson.pdf_documents?.length || 0) + ((activeLesson.pdf_urls?.length || 0) > (activeLesson.pdf_documents?.length || 0) ? (activeLesson.pdf_urls?.length || 0) - (activeLesson.pdf_documents?.length || 0) : 0))} file(s)
                    </span>
                  </div>

                  {/* List of currently attached documents */}
                  {((activeLesson.pdf_documents && activeLesson.pdf_documents.length > 0) ||
                    (activeLesson.pdf_urls && activeLesson.pdf_urls.length > 0)) && (
                    <div className="space-y-1.5">
                      {/* Attached PDF Documents */}
                      {activeLesson.pdf_documents?.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-neutral-800 dark:text-stone-200 truncate">
                                {doc.name}
                              </p>
                              <div className="flex items-center space-x-2 text-[10px] text-stone-400 font-mono">
                                <span>{doc.size || 'PDF Document'}</span>
                                {doc.url.startsWith('data:') && (
                                  <span className="text-emerald-500 font-semibold">• Uploaded file</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0 ml-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-stone-400 hover:text-emerald-500 p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                              title="Preview document"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                const newDocs = (activeLesson.pdf_documents || []).filter(d => d.id !== doc.id);
                                const newUrls = (activeLesson.pdf_urls || []).filter(u => u !== doc.url);
                                handleUpdateLesson(activeLesson.id, {
                                  pdf_documents: newDocs,
                                  pdf_urls: newUrls
                                });
                                showNotice(`Removed "${doc.name}"`);
                              }}
                              className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Remove document"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Any legacy pdf_urls not already in pdf_documents */}
                      {activeLesson.pdf_urls
                        ?.filter(url => !(activeLesson.pdf_documents || []).some(d => d.url === url))
                        .map((url, idx) => {
                          const fileName = url.split('/').pop()?.split('?')[0] || `Lesson Schematic ${idx + 1}.pdf`;
                          return (
                            <div
                              key={`legacy_${idx}`}
                              className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-neutral-800 dark:text-stone-200 truncate">
                                    {fileName}
                                  </p>
                                  <p className="text-[10px] text-stone-400 font-mono truncate">{url}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0 ml-2">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-stone-400 hover:text-emerald-500 p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                                  title="Preview document"
                                >
                                  <Eye className="h-4 w-4" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newUrls = (activeLesson.pdf_urls || []).filter(u => u !== url);
                                    handleUpdateLesson(activeLesson.id, { pdf_urls: newUrls });
                                    showNotice('Removed URL attachment');
                                  }}
                                  className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                                  title="Remove link"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Upload Field for new PDF */}
                  <MediaUploadField
                    label="Attach Lesson PDF or Blueprint"
                    type="pdf"
                    value=""
                    onChange={(val, meta) => {
                      if (val) {
                        const newDoc: CoursePdfDocument = {
                          id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                          name: meta?.fileName || 'Lesson Blueprint.pdf',
                          url: val,
                          size: meta?.fileSize || 'PDF Document',
                          uploaded_at: new Date().toISOString()
                        };
                        const updatedDocs = [...(activeLesson.pdf_documents || []), newDoc];
                        const updatedUrls = Array.from(new Set([...(activeLesson.pdf_urls || []), val]));
                        handleUpdateLesson(activeLesson.id, {
                          pdf_documents: updatedDocs,
                          pdf_urls: updatedUrls
                        });
                        showNotice(`Attached "${newDoc.name}" to lesson`);
                      }
                    }}
                    helperText="Upload field schematics, soil analysis templates, or planting charts from your device or web link."
                  />
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-stone-400">
                Select or create a lesson from the outline to edit its contents.
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* ADD CUSTOM CATEGORY MODAL                                    */}
        {/* ============================================================ */}
        {isAddCategoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0f1714] border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-stone-100">
                      Create Course Category
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Instantly shared with all creators & searchable in Learn Hub
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomCategory} className="space-y-4">
                {categoryError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                    {categoryError}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mushroom Cultivation, Agroforestry, Herbalism"
                    value={newCategoryName}
                    onChange={e => {
                      setNewCategoryName(e.target.value);
                      if (categoryError) setCategoryError(null);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Icon / Emoji Picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                      Category Icon / Emoji
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={newCategoryIcon}
                      onChange={e => setNewCategoryIcon(e.target.value)}
                      className="w-16 px-2.5 py-1 text-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['🌿', '🍄', '🪵', '🐑', '🐝', '🌾', '🪱', '🔬', '⚙️', '☀️', '💧', '🍎', '🏡', '🍯', '🐟', '🌊', '🪴', '🌻'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewCategoryIcon(emoji)}
                        className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                          newCategoryIcon === emoji
                            ? 'bg-emerald-500/20 border-2 border-emerald-500 scale-105'
                            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                    Short Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mycelium inoculation, substrate recipes & medicinal yields"
                    value={newCategoryDescription}
                    onChange={e => setNewCategoryDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-stone-500">
                    Displayed under category badges in Learn Hub search and category cards.
                  </p>
                </div>

                {/* Live Preview Card */}
                <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Learn Hub Filter Preview</span>
                  <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-white dark:bg-[#070b09] border border-emerald-500/30">
                    <span className="text-xl">{newCategoryIcon || '🌿'}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {newCategoryName.trim() || 'New Category Name'}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">
                        {newCategoryDescription.trim() || 'Custom permaculture discipline'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 text-xs font-bold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-stone-950 text-xs font-extrabold shadow-md hover:brightness-110 cursor-pointer transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create & Select Category</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
