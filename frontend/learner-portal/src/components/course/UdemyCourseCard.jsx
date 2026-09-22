import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  Flame,
  ArrowRight,
  GraduationCap,
  Award,
} from "lucide-react";
import { getAutoThumbnail } from "../../utils/courseThumbnails";

export default function UdemyCourseCard({
  course,
  isEnrolled = false,
  onEnroll,
  isEnrolling = false,
}) {
  const navigate = useNavigate();

  // Dynamic values or calculated stats
  const thumbnail = course.imageUrl || course.thumbnailUrl || getAutoThumbnail(course.title, course.category);
  const instructor = course.instructorName || course.author || "Aritra Basak";
  
  // Deterministic ratings and view counts for rich realism
  const seed = (course.id || course.title || "course").toString().split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rating = (4.4 + ((seed % 6) * 0.1)).toFixed(1);
  const ratingCount = Math.floor(45 + (seed % 19) * 95);
  const viewsCount = Math.floor(1200 + (seed % 45) * 210);

  const isMostViewed = viewsCount > 4000 || seed % 3 === 0;
  const isBestseller = rating >= 4.7 || seed % 4 === 0;
  const isPremium = course.level === "ADVANCED" || seed % 5 === 0;

  // Price generation
  const price = 449 + (seed % 4) * 20;
  const originalPrice = price * 4 + 129;

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative">
      {/* ── Top Thumbnail Section ── */}
      <div className="relative overflow-hidden rounded-2xl aspect-video bg-slate-900">
        <img
          src={thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Dynamic Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {isMostViewed && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-amber-500/95 text-slate-900 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Flame size={11} className="text-slate-900 fill-slate-900" />
              Most Viewed
            </span>
          )}
          {isBestseller && !isMostViewed && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-emerald-500/95 text-white backdrop-blur-md shadow-sm">
              Bestseller
            </span>
          )}
          {isPremium && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-indigo-600/90 text-white backdrop-blur-md shadow-sm">
              Premium
            </span>
          )}
        </div>

        {/* Live Views Counter on Thumbnail */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-mono font-medium text-slate-200 flex items-center gap-1">
          <Eye size={11} className="text-blue-400" />
          {viewsCount.toLocaleString()} views
        </div>
      </div>

      {/* ── Course Info Section ── */}
      <div className="pt-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={() => navigate(`/courses/${course.id}`)}
            className="text-[15px] font-bold text-slate-900 line-clamp-2 leading-snug cursor-pointer group-hover:text-blue-600 transition-colors"
            title={course.title}
          >
            {course.title}
          </h3>

          {/* Instructor Name */}
          <p className="text-xs text-slate-500 font-medium mt-1 truncate">
            {instructor}
          </p>

          {/* Ratings & Badges Row (Udemy Style) */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
            {isPremium && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                <Sparkles size={10} />
                Premium
              </span>
            )}
            {isBestseller && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                Bestseller
              </span>
            )}

            {/* Star Rating */}
            <div className="flex items-center gap-1">
              <span className="font-bold text-amber-600 text-xs">{rating}</span>
              <div className="flex text-amber-500">
                <Star size={12} className="fill-amber-500" />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                ({ratingCount.toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom Price & Action Row ── */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Price */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900">
                ₹{price}.00
              </span>
              <span className="text-xs text-slate-400 line-through">
                ₹{originalPrice}.00
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block">
              76% off
            </span>
          </div>

          {/* Action Button */}
          {isEnrolled ? (
            <button
              onClick={() => navigate(`/learn/${course.id}`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              Start Learning &rarr;
            </button>
          ) : (
            <button
              onClick={() => (onEnroll ? onEnroll(course.id) : navigate(`/courses/${course.id}`))}
              disabled={isEnrolling}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap size={14} />
              {isEnrolling ? "Enrolling..." : "Enroll Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
