import { useState } from "react";
import { Link } from "wouter";
import { useGetCourses, getGetCoursesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function Courses() {
  const { data: courses, isLoading } = useGetCourses({ query: { queryKey: getGetCoursesQueryKey() } });
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = (courses ?? []).filter((c) => {
    const matchLevel = levelFilter === "all" || c.level === levelFilter;
    const matchSearch = c.title.includes(search) || c.description.includes(search);
    return matchLevel && matchSearch;
  });

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-primary font-medium mb-1">COURSES</p>
        <h1 className="text-2xl font-extrabold mb-2">الكورسات المتاحة</h1>
        <p className="text-muted-foreground text-sm">اختاري المستوى المناسب وابدئي رحلتك</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="ابحثي عن كورس..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          data-testid="input-search-courses"
        />
      </div>

      {/* Level filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all", label: "الكل" },
          { key: "beginner", label: "مبتدئ" },
          { key: "intermediate", label: "متوسط" },
          { key: "advanced", label: "متقدم" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLevelFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              levelFilter === key
                ? "bg-primary text-white border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
            data-testid={`button-filter-${key}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">لا توجد كورسات</p>
          <p className="text-sm mt-1">جربي تغيير الفلتر أو البحث</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-card rounded-2xl border border-border p-5 shadow-sm"
              data-testid={`card-course-${course.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${levelColors[course.level]}`}>
                  {levelLabels[course.level] ?? course.level}
                </span>
                <span className="font-bold text-xl text-primary">${course.price}</span>
              </div>
              <h3 className="font-bold text-base mb-1.5">{course.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{course.description}</p>
              {course.startDate && (
                <p className="text-xs text-muted-foreground mb-3">
                  تاريخ البدء:{" "}
                  <span className="text-foreground font-medium">
                    {new Date(course.startDate).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{course.duration} · {course.seatsAvailable} مقعد متبقي</span>
                <Link
                  href={`/courses/${course.id}`}
                  className="text-sm text-primary font-medium hover:underline"
                  data-testid={`button-view-course-${course.id}`}
                >
                  عرض التفاصيل ←
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
