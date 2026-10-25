import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  Lock,
  Play,
  FileText,
  Download,
  Image as ImageIcon,
  Share2,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  Eye,
  Check,
  Star,
  ThumbsUp,
  MessageSquare,
  Trash2,
  Filter,
  GraduationCap
} from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';
import { Course, CourseLesson, CourseReview } from '../types';

interface CourseViewerProps {
  courseId: string;
  navigate: (route: string) => void;
}

export const CourseViewer: React.FC<CourseViewerProps> = ({ courseId, navigate }) => {
  const {
    courses,
    currentUser,
    isCourseUnlocked,
    enrollCourse,
    momentsBalance,
    openTopUpModal,
    completedLessonIds,
    toggleLessonCompletion,
    isLessonCompleted,
    courseReviews,
    addCourseReview,
    deleteCourseReview,
    likeCourseReview,
    getCourseReviews,
    isCourseFinishedByStudent
  } = usePermaculture();

  const course = courses.find(c => c.id === courseId);

  // Flatten lessons for easy navigation
  const allLessons = useMemo(() => {
    if (!course) return [];
    const list: { sectionTitle: string; lesson: CourseLesson }[] = [];
    course.sections.forEach(sec => {
      sec.lessons.forEach(l => {
        list.push({ sectionTitle: sec.title, lesson: l });
      });
    });
    return list;
  }, [course]);

  // Selected Lesson state (defaults to first lesson)
  const [selectedLessonId, setSelectedLessonId] = useState<string>(() => {
    if (allLessons.length > 0) return allLessons[0].lesson.id;
    return '';
  });

  // Top navigation tabs: 'lesson' player or 'reviews' tab
  const [activeTab, setActiveTab] = useState<'lesson' | 'reviews'>('lesson');

  // Review Form state
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [titleInput, setTitleInput] = useState<string>('');
  const [commentInput, setCommentInput] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

  // Filter & Sort state for Reviews Tab
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <p className="text-sm text-stone-500">The course you are looking for may have been removed or moved.</p>
        <button
          onClick={() => navigate('learn')}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-stone-950 font-bold text-xs cursor-pointer"
        >
          Back to Learn Marketplace
        </button>
      </div>
    );
  }

  const isUnlocked = isCourseUnlocked(course);

  // Current active lesson object
  const currentLessonIndex = allLessons.findIndex(item => item.lesson.id === selectedLessonId);
  const currentItem = allLessons[currentLessonIndex] || allLessons[0];
  const currentLesson = currentItem?.lesson;

  // Access check for this specific lesson
  const canAccessCurrentLesson = isUnlocked || currentLesson?.is_free_preview;

  // Progress metrics
  const completedCount = allLessons.filter(item => isLessonCompleted(item.lesson.id)).length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const isFinished = allLessons.length > 0 && completedCount >= allLessons.length;

  // Reviews for this course
  const reviews = getCourseReviews(course.id);
  const userExistingReview = reviews.find(r => r.user_id === currentUser.id);

  // Average Rating calculation
  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount
    : 5.0;

  // Rating breakdown stats
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { stars, count, percentage };
  });

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (ratingFilter !== 'all') {
      result = result.filter(r => r.rating === ratingFilter);
    }
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'helpful') {
      result.sort((a, b) => b.helpful_count - a.helpful_count);
    }
    return result;
  }, [reviews, ratingFilter, sortBy]);

  const handleNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentLessonIndex + 1].lesson;
      setSelectedLessonId(nextLesson.id);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = allLessons[currentLessonIndex - 1].lesson;
      setSelectedLessonId(prevLesson.id);
    }
  };

  const handleToggleCurrentCompletion = () => {
    if (!currentLesson) return;
    toggleLessonCompletion(currentLesson.id);
  };

  // Quick helper to mark all lessons complete
  const handleMarkAllLessonsComplete = () => {
    allLessons.forEach(item => {
      if (!isLessonCompleted(item.lesson.id)) {
        toggleLessonCompletion(item.lesson.id);
      }
    });
  };

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setIsSubmittingReview(true);
    addCourseReview({
      course_id: course.id,
      rating: ratingInput,
      title: titleInput.trim() || undefined,
      comment: commentInput.trim()
    });

    setTitleInput('');
    setCommentInput('');
    setIsSubmittingReview(false);
    setReviewSuccessMessage('Thank you! Your verified student review was published successfully.');
    setTimeout(() => setReviewSuccessMessage(null), 4000);
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return 'Exceptional — Transformative field knowledge';
      case 4:
        return 'Very Good — Highly actionable techniques';
      case 3:
        return 'Good — Solid fundamental principles';
      case 2:
        return 'Fair — Needs more practical diagrams';
      case 1:
        return 'Poor — Needs substantial improvement';
      default:
        return 'Select a rating';
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#FBF9F5] dark:bg-[#070b09] text-stone-900 dark:text-stone-100 transition-colors">
      
      {/* ============================================================ */}
      {/* 1. TEACHABLE-STYLE SIDEBAR: CURRICULUM TREE & CHECKBOXES     */}
      {/* ============================================================ */}
      <aside className="w-full lg:w-88 flex-shrink-0 border-r border-[#E7E1D8] dark:border-stone-800 bg-[#FAF7F2] dark:bg-[#0c120f] flex flex-col h-auto lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 z-20 overflow-y-auto">
        
        {/* Course Header & Back Button */}
        <div className="p-4 border-b border-[#E7E1D8] dark:border-stone-800 space-y-3">
          <button
            type="button"
            onClick={() => navigate('learn')}
            className="flex items-center space-x-1.5 text-xs text-stone-500 hover:text-emerald-500 font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to All Courses</span>
          </button>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
              {course.category}
            </span>
            <h2 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-stone-100 line-clamp-2">
              {course.title}
            </h2>
          </div>

          {/* Progress Bar & Status */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="text-[11px] font-medium flex items-center space-x-1">
                {isFinished ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Course Finished!
                  </span>
                ) : (
                  <span>Curriculum Progress</span>
                )}
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-500">
                {progressPercent}% ({completedCount}/{allLessons.length})
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Dual Navigation Buttons: Lessons vs Reviews */}
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('lesson')}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'lesson'
                  ? 'bg-emerald-500 text-stone-950 shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800/80 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Lessons</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-emerald-500 text-stone-950 shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800/80 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>Reviews</span>
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-stone-950/20 font-mono">
                {reviews.length}
              </span>
            </button>
          </div>
        </div>

        {/* Sections & Lessons Tree */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {course.sections.map((sec) => (
            <div key={sec.id} className="space-y-1">
              <div className="px-2 py-1">
                <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {sec.title}
                </h3>
              </div>

              <div className="space-y-0.5">
                {sec.lessons.map(lesson => {
                  const isSelected = lesson.id === selectedLessonId && activeTab === 'lesson';
                  const isCompleted = isLessonCompleted(lesson.id);
                  const canView = isUnlocked || lesson.is_free_preview;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        setSelectedLessonId(lesson.id);
                        setActiveTab('lesson');
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        {/* Completion Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLessonCompletion(lesson.id);
                          }}
                          className={`h-4 w-4 rounded-md flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-stone-950 shadow-2xs'
                              : 'border-neutral-300 dark:border-neutral-700 hover:border-emerald-500'
                          }`}
                          title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>

                        <div className="truncate">
                          <p className="truncate text-xs font-medium">{lesson.title}</p>
                          {lesson.duration_minutes && (
                            <span className="text-[10px] text-stone-400 font-mono">
                              {lesson.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Lesson Badges: Preview or Lock */}
                      <div className="shrink-0 ml-2 flex items-center space-x-1">
                        {lesson.is_free_preview && !isUnlocked && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase">
                            Free Preview
                          </span>
                        )}
                        {!canView && (
                          <Lock className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Course Review CTA */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`w-full py-2 px-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-500'
                : 'border border-neutral-200 dark:border-neutral-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <span>Student Reviews & Ratings</span>
            </div>
            <span className="font-mono text-[11px]">{averageRating.toFixed(1)} ★</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CONTENT AREA: LESSON VIEWER OR REVIEWS TAB           */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Tab Switcher Bar */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-[#0c120f]/80 backdrop-blur-md px-4 sm:px-8 py-3 sticky top-0 z-10 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={() => setActiveTab('lesson')}
              className={`flex items-center space-x-2 py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'lesson'
                  ? 'bg-emerald-500 text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Lesson Player</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center space-x-2 py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-emerald-500 text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>Reviews</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'reviews'
                  ? 'bg-stone-950/20 text-stone-950'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}>
                {reviews.length}
              </span>
            </button>
          </div>

          {/* Quick Rating Badge & Completion Indicator */}
          <div className="flex items-center space-x-3 text-xs">
            {isFinished ? (
              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Course Completed</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleMarkAllLessonsComplete}
                className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-500/10 text-stone-500 hover:text-emerald-500 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Mark all lessons as complete to unlock graduate review"
              >
                <span>⚡ Complete All</span>
              </button>
            )}

            <div className="flex items-center space-x-1.5 text-stone-500">
              <span className="font-extrabold text-stone-800 dark:text-stone-200">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= Math.round(averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-300 dark:text-neutral-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-stone-400 font-mono">({reviews.length})</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: LESSON PLAYER VIEW                                    */}
        {/* ============================================================ */}
        {activeTab === 'lesson' && (
          <>
            {currentLesson ? (
              <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                
                {/* Lesson Title Header & Navigation Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-stone-500">
                      {currentItem?.sectionTitle}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-stone-100">
                      {currentLesson.title}
                    </h1>
                  </div>

                  {/* Mark Complete Checkbox CTA & Step Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleToggleCurrentCompletion}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isLessonCompleted(currentLesson.id)
                          ? 'bg-emerald-500 border-emerald-500 text-stone-950 font-bold'
                          : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-emerald-500 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{isLessonCompleted(currentLesson.id) ? 'Completed' : 'Mark as Complete'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrevLesson}
                      disabled={currentLessonIndex === 0}
                      className="p-2 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-stone-600 dark:text-stone-300 disabled:opacity-40 hover:bg-neutral-100 cursor-pointer"
                      title="Previous Lesson"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextLesson}
                      disabled={currentLessonIndex === allLessons.length - 1}
                      className="p-2 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-stone-600 dark:text-stone-300 disabled:opacity-40 hover:bg-neutral-100 cursor-pointer"
                      title="Next Lesson"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* ACCESS CONTROL GUARD: Non-Preview Paywall Gate */}
                {!canAccessCurrentLesson ? (
                  <div className="rounded-3xl border border-amber-500/40 bg-white dark:bg-neutral-900 p-8 sm:p-12 text-center space-y-5 shadow-xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
                      <Lock className="h-8 w-8" />
                    </div>

                    <div className="max-w-md mx-auto space-y-2">
                      <h2 className="text-xl font-extrabold text-neutral-900 dark:text-stone-100">
                        This Lesson is Locked
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                        {course.access_type === 'supporter_only'
                          ? 'This lesson is reserved for active supporters of the permaculture guild.'
                          : `Unlock full access to all ${allLessons.length} lessons, downloadable blueprints, and videos.`}
                      </p>
                    </div>

                    <div className="max-w-xs mx-auto space-y-3 pt-2">
                      {course.access_type === 'supporter_only' ? (
                        <button
                          type="button"
                          onClick={() => navigate(`profile/${course.creator_id}`)}
                          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                        >
                          ⭐ Join Guild Supporter Tier ($5/mo)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => enrollCourse(course.id)}
                          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 text-stone-950 font-extrabold text-sm shadow-lg shadow-emerald-950/40 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <span>💧</span>
                          <span>
                            Enroll for {Math.round(course.price * 100)} Rain Drops (${course.price.toFixed(2)})
                          </span>
                        </button>
                      )}

                      <p className="text-[11px] text-stone-400 font-mono">
                        Your Wallet Balance: {momentsBalance.toLocaleString()} Rain Drops 💧
                      </p>
                    </div>
                  </div>
                ) : (
                  /* UNLOCKED / FREE PREVIEW: VIDEO & LESSON CONTENT */
                  <div className="space-y-6">
                    
                    {/* 1. Responsive 16:9 Video iFrame Container */}
                    {currentLesson.iframe_video_url ? (
                      <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-neutral-200 dark:border-neutral-800 shadow-xl">
                        <iframe
                          src={currentLesson.iframe_video_url}
                          title={currentLesson.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8 text-center bg-white/40 dark:bg-neutral-900/40 space-y-2">
                        <BookOpen className="h-8 w-8 text-stone-400 mx-auto" />
                        <p className="text-xs font-bold text-stone-500">Reading & Practical Field Exercise</p>
                        <p className="text-[11px] text-stone-400">This lesson emphasizes written design schematics and downloadable resources.</p>
                      </div>
                    )}

                    {/* Free Preview Notification Pill */}
                    {currentLesson.is_free_preview && !isUnlocked && (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span>You are watching a Free Preview lesson.</span>
                        </div>
                        <button
                          onClick={() => enrollCourse(course.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 text-stone-950 font-bold hover:brightness-110 cursor-pointer"
                        >
                          Enroll Full Course
                        </button>
                      </div>
                    )}

                    {/* 2. Lesson Description & Text Content */}
                    <div className="rounded-3xl bg-white dark:bg-[#0f1714] border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-4">
                      <h3 className="font-bold text-base text-neutral-900 dark:text-stone-100 flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        <span>Lesson Guide & Field Notes</span>
                      </h3>
                      <div className="text-sm leading-relaxed text-neutral-700 dark:text-stone-300 whitespace-pre-line font-sans space-y-3">
                        {currentLesson.content_text || 'No written notes provided for this lesson.'}
                      </div>
                    </div>

                    {/* 3. Downloadable PDF & Image Attachments */}
                    {((currentLesson.pdf_documents && currentLesson.pdf_documents.length > 0) ||
                      (currentLesson.pdf_urls && currentLesson.pdf_urls.length > 0) ||
                      (currentLesson.image_urls && currentLesson.image_urls.length > 0) ||
                      (course.overview_pdfs && course.overview_pdfs.length > 0)) && (
                      <div className="rounded-3xl bg-white dark:bg-[#0f1714] border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-neutral-900 dark:text-stone-100 flex items-center space-x-2">
                            <Download className="h-4 w-4 text-emerald-500" />
                            <span>Downloadable Course & Lesson Materials</span>
                          </h3>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {(currentLesson.pdf_documents?.length || 0) +
                              (currentLesson.pdf_urls?.filter(u => !(currentLesson.pdf_documents || []).some(d => d.url === u)).length || 0) +
                              (currentLesson.image_urls?.length || 0) +
                              (course.overview_pdfs?.length || 0)} resources
                          </span>
                        </div>

                        {/* Lesson PDFs (Uploaded Documents & Links) */}
                        {((currentLesson.pdf_documents && currentLesson.pdf_documents.length > 0) ||
                          (currentLesson.pdf_urls && currentLesson.pdf_urls.length > 0)) && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider font-mono">
                              Lesson Schematics & Blueprints
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {/* Uploaded Rich PDF Documents */}
                              {currentLesson.pdf_documents?.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.url}
                                  download={doc.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-3 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 bg-neutral-50 dark:bg-neutral-900/60 transition-all text-xs font-semibold group"
                                >
                                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="truncate flex-1 text-left min-w-0">
                                    <p className="truncate text-neutral-800 dark:text-stone-200 group-hover:text-emerald-500">
                                      {doc.name}
                                    </p>
                                    <div className="flex items-center space-x-2 text-[10px] text-stone-400 font-mono">
                                      <span>{doc.size || 'PDF'}</span>
                                      <span className="text-emerald-500 font-medium">Download</span>
                                    </div>
                                  </div>
                                  <Download className="h-4 w-4 text-stone-400 group-hover:text-emerald-500 shrink-0 ml-1 transition-colors" />
                                </a>
                              ))}

                              {/* Any legacy pdf_urls not in pdf_documents */}
                              {currentLesson.pdf_urls
                                ?.filter(url => !(currentLesson.pdf_documents || []).some(d => d.url === url))
                                .map((pdf, idx) => (
                                  <a
                                    key={`legacy_${idx}`}
                                    href={pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-3 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 bg-neutral-50 dark:bg-neutral-900/60 transition-all text-xs font-semibold group"
                                  >
                                    <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="truncate flex-1 text-left min-w-0">
                                      <p className="truncate text-neutral-800 dark:text-stone-200 group-hover:text-emerald-500">
                                        {pdf.split('/').pop()?.split('?')[0] || `Engineering Schematic ${idx + 1}.pdf`}
                                      </p>
                                      <span className="text-[10px] text-stone-400 font-mono">Download PDF</span>
                                    </div>
                                    <Download className="h-4 w-4 text-stone-400 group-hover:text-emerald-500 shrink-0 ml-1 transition-colors" />
                                  </a>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Course-Level Overview PDF Library */}
                        {course.overview_pdfs && course.overview_pdfs.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                              <span>Course Overview & Reference Library</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                                Course-Wide
                              </span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {course.overview_pdfs.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.url}
                                  download={doc.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-3 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 bg-neutral-50 dark:bg-neutral-900/60 transition-all text-xs font-semibold group"
                                >
                                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="truncate flex-1 text-left min-w-0">
                                    <p className="truncate text-neutral-800 dark:text-stone-200 group-hover:text-emerald-500">
                                      {doc.name}
                                    </p>
                                    <div className="flex items-center space-x-2 text-[10px] text-stone-400 font-mono">
                                      <span>{doc.size || 'PDF'}</span>
                                      <span className="text-emerald-500 font-medium">Download</span>
                                    </div>
                                  </div>
                                  <Download className="h-4 w-4 text-stone-400 group-hover:text-emerald-500 shrink-0 ml-1 transition-colors" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reference Diagrams & Photos */}
                        {currentLesson.image_urls && currentLesson.image_urls.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider font-mono">
                              Reference Diagrams & Field Photos
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {currentLesson.image_urls.map((img, idx) => (
                                <a
                                  key={idx}
                                  href={img}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-3 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 bg-neutral-50 dark:bg-neutral-900/60 transition-all text-xs font-semibold group"
                                >
                                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 shrink-0">
                                    <ImageIcon className="h-4 w-4" />
                                  </div>
                                  <div className="truncate flex-1 text-left min-w-0">
                                    <p className="truncate text-neutral-800 dark:text-stone-200 group-hover:text-emerald-500">
                                      Reference Diagram #{idx + 1}
                                    </p>
                                    <span className="text-[10px] text-stone-400 font-mono">High Resolution Image</span>
                                  </div>
                                  <Eye className="h-4 w-4 text-stone-400 group-hover:text-emerald-500 shrink-0 ml-1 transition-colors" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Course Finished Congratulations Banner */}
                    {isFinished && (
                      <div className="rounded-3xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 text-left">
                          <div className="p-3 rounded-2xl bg-emerald-500 text-stone-950">
                            <GraduationCap className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-stone-100">
                              You've Completed All Course Lessons!
                            </h4>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              Rate this course and leave a verified review to help fellow regenerative learners.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('reviews')}
                          className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                        >
                          <Star className="h-4 w-4 fill-current" />
                          <span>Write Student Review</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-stone-400">
                Select a lesson from the curriculum sidebar to start learning.
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* TAB 2: COURSE REVIEWS & RATINGS HUB                          */}
        {/* ============================================================ */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            
            {/* 1. Header Overview & Ratings Summary Banner */}
            <div className="rounded-3xl bg-white dark:bg-[#0c120f] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                    Student Feedback & Rating Score
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-stone-100">
                    Course Reviews
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Verified ratings submitted by students who participated in this curriculum.
                  </p>
                </div>

                {/* Big Overall Star Score */}
                <div className="flex items-center space-x-4 self-start sm:self-center p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800">
                  <div className="text-center pr-3 border-r border-neutral-200 dark:border-neutral-800">
                    <span className="text-3xl font-black text-amber-500 font-mono">
                      {averageRating.toFixed(1)}
                    </span>
                    <div className="flex items-center text-amber-400 mt-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= Math.round(averageRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-300 dark:text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-neutral-800 dark:text-stone-200">
                      {totalReviewsCount} {totalReviewsCount === 1 ? 'Review' : 'Reviews'}
                    </p>
                    <p className="text-[10px] text-stone-500">100% Verified Students</p>
                  </div>
                </div>
              </div>

              {/* Star Rating Distribution Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
                {ratingDistribution.map(({ stars, count, percentage }) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setRatingFilter(ratingFilter === stars ? 'all' : stars)}
                    className={`p-2.5 rounded-2xl border transition-all text-left cursor-pointer ${
                      ratingFilter === stars
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center space-x-1">
                        <span>{stars}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>

              {/* Current Student Completion Badge & Notice */}
              <div className="rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/60 p-4 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    isFinished
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    {isFinished ? <Award className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-stone-100">
                      {isFinished
                        ? '✓ You have completed 100% of the course curriculum'
                        : `Progress: ${completedCount} of ${allLessons.length} lessons finished (${progressPercent}%)`}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {isFinished
                        ? 'Your review is stamped with the Verified Course Graduate badge.'
                        : 'Students who finish all lessons receive a verified graduate badge on their reviews.'}
                    </p>
                  </div>
                </div>

                {!isFinished && (
                  <button
                    type="button"
                    onClick={handleMarkAllLessonsComplete}
                    className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    ⚡ Mark All Complete
                  </button>
                )}
              </div>
            </div>

            {/* 2. Review Form Composer Card (Allow Students to Rate and Comment) */}
            <div className="rounded-3xl bg-white dark:bg-[#0c120f] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-stone-100 flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-emerald-500" />
                    <span>{userExistingReview ? 'Update Your Course Review' : 'Rate & Review This Course'}</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Share your practical observations and field yields with the permaculture community.
                  </p>
                </div>

                {isFinished && (
                  <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider font-mono">
                    ✓ Verified Graduate
                  </span>
                )}
              </div>

              {reviewSuccessMessage && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{reviewSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* 5-Star Interactive Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Your Rating:
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (hoverRating || ratingInput) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingInput(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                            title={`${star} Star${star > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-neutral-300 dark:text-neutral-700'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 font-mono">
                      {getRatingLabel(hoverRating || ratingInput)}
                    </span>
                  </div>
                </div>

                {/* Review Headline / Title Input */}
                <div className="space-y-1">
                  <label htmlFor="review-title" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Review Headline (Optional)
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="e.g. Swale construction and level sill spillways explained simply..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-emerald-500 text-neutral-900 dark:text-stone-100 placeholder-stone-400 outline-none transition-colors"
                  />
                </div>

                {/* Review Comment Textarea */}
                <div className="space-y-1">
                  <label htmlFor="review-comment" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Review Details & Practical Learnings <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="review-comment"
                    rows={3}
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="How did you apply these techniques on your land? What was your biggest takeaway from this course?"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-emerald-500 text-neutral-900 dark:text-stone-100 placeholder-stone-400 outline-none transition-colors resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2 text-[11px] text-stone-500">
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover shrink-0"
                    />
                    <span>Posting as <strong className="text-stone-700 dark:text-stone-300">@{currentUser.username}</strong></span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview || !commentInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>{userExistingReview ? 'Update Review' : 'Submit Review'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 3. Filter & Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-stone-500 flex items-center space-x-1 mr-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setRatingFilter('all')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    ratingFilter === 'all'
                      ? 'bg-emerald-500 text-stone-950 font-bold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  All ({reviews.length})
                </button>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingFilter(star)}
                      className={`px-2 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                        ratingFilter === star
                          ? 'bg-emerald-500 text-stone-950 font-bold'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                    >
                      <span>{star}</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      <span className="text-[10px] text-stone-400">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-2 text-xs shrink-0 self-start sm:self-auto">
                <span className="text-stone-500 font-semibold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'highest' | 'helpful')}
                  aria-label="Sort reviews by"
                  className="px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-stone-200 outline-none cursor-pointer"
                >
                  <option value="newest">Most Recent</option>
                  <option value="highest">Highest Rating</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>

            {/* 4. Student Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center bg-white/40 dark:bg-neutral-900/40 space-y-3">
                  <Star className="h-8 w-8 text-stone-400 mx-auto" />
                  <p className="text-sm font-bold text-stone-600 dark:text-stone-300">
                    No reviews found matching this filter
                  </p>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    {reviews.length === 0
                      ? 'Be the first student to finish this course and leave a review!'
                      : 'Try selecting "All" to view all student reviews.'}
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => {
                  const isOwnReview = review.user_id === currentUser.id;
                  const timeFormatted = new Date(review.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={review.id}
                      className={`rounded-3xl p-6 transition-all border ${
                        isOwnReview
                          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/40 shadow-xs'
                          : 'bg-white dark:bg-[#0c120f] border-neutral-200 dark:border-neutral-800 shadow-2xs'
                      } space-y-3`}
                    >
                      {/* Review Top Row: Student Profile & Stars */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <img
                            src={review.user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                            alt={review.user.full_name}
                            className="h-10 w-10 rounded-full object-cover shrink-0 ring-2 ring-emerald-500/30"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-extrabold text-sm text-neutral-900 dark:text-stone-100">
                                {review.user.full_name}
                              </h4>
                              {isOwnReview && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase">
                                  You
                                </span>
                              )}
                              {review.is_verified_completion && (
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">
                                  <GraduationCap className="h-3 w-3" />
                                  <span>Verified Graduate</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 font-mono">
                              @{review.user.username} • {timeFormatted}
                            </p>
                          </div>
                        </div>

                        {/* Star Rating Display */}
                        <div className="flex items-center space-x-1.5 self-start sm:self-center">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-neutral-300 dark:text-neutral-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-400">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>

                      {/* Review Title */}
                      {review.title && (
                        <h5 className="font-bold text-sm text-neutral-900 dark:text-stone-100 pt-1">
                          {review.title}
                        </h5>
                      )}

                      {/* Review Comment Body */}
                      <p className="text-xs sm:text-sm text-neutral-700 dark:text-stone-300 leading-relaxed font-sans whitespace-pre-line">
                        {review.comment}
                      </p>

                      {/* Bottom Footer: Helpful button & Delete if own review */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-xs">
                        <button
                          type="button"
                          onClick={() => likeCourseReview(review.id)}
                          className="flex items-center space-x-1.5 text-stone-500 hover:text-emerald-500 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Helpful</span>
                          {review.helpful_count > 0 && (
                            <span className="font-mono text-[11px]">({review.helpful_count})</span>
                          )}
                        </button>

                        {isOwnReview && (
                          <button
                            type="button"
                            onClick={() => deleteCourseReview(review.id)}
                            className="flex items-center space-x-1 text-red-400 hover:text-red-500 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-red-500/10"
                            title="Delete your review"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
