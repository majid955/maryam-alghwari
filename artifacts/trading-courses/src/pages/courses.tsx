import { useState } from "react";
import { Link } from "wouter";
import { useGetCourses, getGetCoursesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, ChevronRight, Search } from "lucide-react";

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function Courses() {
  const { data: courses, isLoading } = useGetCourses({ query: { queryKey: getGetCoursesQueryKey() } });
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = (courses ?? []).filter((c) => {
    const matchLevel = levelFilter === "all" || c.level === levelFilter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10">
        <p className="text-xs text-primary uppercase tracking-widest mb-2 font-medium">All Programs</p>
        <h1 className="text-3xl font-bold mb-1">Trading Courses</h1>
        <p className="text-muted-foreground">Choose your level and start learning today.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            data-testid="input-search-courses"
          />
        </div>
        <div className="flex gap-2">
          {["all", "beginner", "intermediate", "advanced"].map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${
                levelFilter === level
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
              data-testid={`button-filter-${level}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No courses found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="border border-border rounded-lg bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 flex flex-col"
              data-testid={`card-course-${course.id}`}
            >
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${levelColors[course.level]}`}>
                    {course.level}
                  </span>
                  <span className="text-xl font-bold text-primary">${course.price}</span>
                </div>
                <h3 className="font-semibold text-base mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-4">{course.description}</p>
                {course.startDate && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Starts: <span className="text-foreground">{new Date(course.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.seatsAvailable}/{course.seats} seats</span>
                </div>
              </div>
              <div className="px-6 pb-6">
                <Button asChild className="w-full" size="sm" data-testid={`button-view-course-${course.id}`}>
                  <Link href={`/courses/${course.id}`}>
                    View Details <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
