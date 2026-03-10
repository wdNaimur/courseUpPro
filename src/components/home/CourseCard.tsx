import { PlayCircle, Trash2 } from "lucide-react";
import type { CourseMetadata } from "../../types/course";

type CourseCardProps = {
  course: CourseMetadata;
  onSelect: (course: CourseMetadata) => void;
  onRemove: (courseId: string) => void;
};

export default function CourseCard({ course, onSelect, onRemove }: CourseCardProps) {
  const progressPercent = JSON.parse(localStorage.getItem(course.id) || "{}");
  const completedCount = Object.values(progressPercent).filter(Boolean).length;
  const progressRatio = course.lessonCount ? Math.round((completedCount / course.lessonCount) * 100) : 0;

  return (
    <div 
      className="glass-panel group relative flex flex-col overflow-hidden rounded-3xl transition-all hover:border-violet-500/35 hover:shadow-2xl hover:shadow-violet-500/10 cursor-pointer"
      onClick={() => onSelect(course)}
    >
      <div className="aspect-video relative overflow-hidden bg-slate-950">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 p-6 text-center">
            <span className="text-xl font-bold text-slate-200 line-clamp-3">{course.title}</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
          <div className="glass-button-primary rounded-full p-4 text-white">
            <PlayCircle className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-1 text-lg font-bold text-slate-100 transition-colors group-hover:text-violet-400">
          {course.title}
        </h3>
        
        <p className="mb-4 line-clamp-1 text-xs text-slate-500">
          {course.path}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{completedCount} / {course.lessonCount} lessons</span>
            <span>{progressRatio}%</span>
          </div>
          
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-400 transition-all"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(course.id);
        }}
        className="glass-button absolute top-4 right-4 z-10 rounded-full p-2 text-slate-200 opacity-0 transition-opacity group-hover:opacity-100 hover:border-red-400/35 hover:bg-red-500/18 hover:text-red-100"
        title="Remove course from list"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
