import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Eye,
  Flame,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { getAutoThumbnail } from "../../utils/courseThumbnails";
import { getCourseViews, incrementCourseViews, getCourseRatingData } from "../../services/courseService";

export default function UdemyCourseCard({
  course,
  isEnrolled = false,
  onEnroll,
  isEnrolling = false,
  isTopViewed = false,
}) {
  const navigate = useNavigate();

  // Dynamic values or calculated stats
  const thumbnail = course.imageUrl || course.thumbnailUrl || getAutoThumbnail(course.title, course.category);
  const instructor =
    course.instructorName && course.instructorName !== "Instructor"
      ? course.instructorName
      : course.author && course.author !== "Instructor"
      ? course.author
      : "Swati Kumari";
  
  // Dynamic unique views and ratings
  const [viewsCount, setViewsCount] = useState(() => getCourseViews(course.id));
  const [ratingData, setRatingData] = useState(() => getCourseRatingData(course.id));
  const rating = ratingData.rating;
  const ratingCount = ratingData.count;

  useEffect(() => {
    setViewsCount(getCourseViews(course.id));
    setRatingData(getCourseRatingData(course.id));
    const handleStorage = () => {
      setViewsCount(getCourseViews(course.id));
      setRatingData(getCourseRatingData(course.id));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [course.id]);

  const handleCardClick = () => {
    const updated = incrementCourseViews(course.id);
    setViewsCount(updated);
    navigate(`/courses/${course.id}`);
  };

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative">
      {/* ── Top Thumbnail Section ── */}
      <div 
        onClick={handleCardClick}
        className="relative overflow-hidden rounded-xl aspect-video bg-slate-900 cursor-pointer"
      >
        <img
          src={thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Dynamic Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {(isTopViewed || viewsCount > 10) && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-amber-500 text-slate-950 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Flame size={11} className="text-slate-950 fill-slate-950" />
              Popular
            </span>
          )}
          {course.level && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-slate-900/80 text-white backdrop-blur-md shadow-sm">
              {course.level}
            </span>
          )}
        </div>

        {/* Dynamic Live Views Counter on Thumbnail */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-md text-[10px] font-mono font-medium text-slate-200 flex items-center gap-1.5 shadow-sm">
          <Eye size={11} className="text-blue-400" />
          {viewsCount.toLocaleString()} {viewsCount === 1 ? "view" : "views"}
        </div>
      </div>

      {/* ── Course Info Section ── */}
      <div className="pt-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={handleCardClick}
            className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug cursor-pointer group-hover:text-blue-600 transition-colors"
            title={course.title}
          >
            {course.title}
          </h3>

          {/* Instructor Name */}
          <p className="text-xs text-slate-500 font-medium mt-1 truncate">
            {instructor}
          </p>

          {/* Dynamic Ratings & Category */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
            {course.category && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                {course.category}
              </span>
            )}

            {/* Dynamic Star Rating */}
            <div className="flex items-center gap-1">
              <span className="font-bold text-amber-600 text-xs">{rating > 0 ? rating : "5.0"}</span>
              <div className="flex text-amber-500">
                <Star size={12} className="fill-amber-500" />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                ({ratingCount > 0 ? `${ratingCount} reviews` : "New"})
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom Action Row (No Price Badge) ── */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <BookOpen size={13} className="text-slate-400" />
            <span>Curriculum Access</span>
          </div>

          {/* Action Button */}
          {isEnrolled ? (
            <button
              onClick={() => {
                incrementCourseViews(course.id);
                navigate(`/learn/${course.id}`);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              Start Learning &rarr;
            </button>
          ) : (
            <button
              onClick={() => {
                incrementCourseViews(course.id);
                if (onEnroll) onEnroll(course.id);
                else navigate(`/courses/${course.id}`);
              }}
              disabled={isEnrolling}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap size={13} />
              {isEnrolling ? "Enrolling..." : "Enroll Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

