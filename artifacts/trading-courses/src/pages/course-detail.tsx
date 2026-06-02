import { useParams, useLocation } from "wouter";
import { useGetCourse, getGetCourseQueryKey, useCreateBooking, useGetMe, getGetMeQueryKey, getGetMyBookingsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Clock, Users, Calendar, CheckCircle } from "lucide-react";

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

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id ?? "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useGetCourse(courseId, {
    query: { enabled: !!courseId, queryKey: getGetCourseQueryKey(courseId) },
  });
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const bookMutation = useCreateBooking();

  const handleBook = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    bookMutation.mutate(
      { data: { courseId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyBookingsQueryKey() });
          toast({ title: "تم الحجز بنجاح", description: "طلب حجزك قيد المراجعة وسيتم تأكيده قريباً." });
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          toast({ title: "خطأ في الحجز", description: err?.data?.error ?? "تعذّر إتمام الحجز.", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-8 w-3/4 mb-3" />
        <Skeleton className="h-20 mb-6" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center text-muted-foreground">
        الكورس غير موجود
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <button
        onClick={() => setLocation("/courses")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        data-testid="button-back"
      >
        <ChevronRight className="h-4 w-4" />
        العودة للكورسات
      </button>

      <div className="flex items-start justify-between mb-4">
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${levelColors[course.level]}`}>
          {levelLabels[course.level] ?? course.level}
        </span>
        <span className="text-2xl font-bold text-primary">${course.price}</span>
      </div>

      <h1 className="text-2xl font-extrabold mb-3">{course.title}</h1>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6">{course.description}</p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">المدة</p>
            <p className="text-sm font-medium">{course.duration}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <Users className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">المقاعد المتبقية</p>
            <p className="text-sm font-medium">{course.seatsAvailable} / {course.seats}</p>
          </div>
        </div>
        {course.startDate && (
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">تاريخ البدء</p>
              <p className="text-sm font-medium">{new Date(course.startDate).toLocaleDateString("ar-SA")}</p>
            </div>
          </div>
        )}
        {course.endDate && (
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">تاريخ الانتهاء</p>
              <p className="text-sm font-medium">{new Date(course.endDate).toLocaleDateString("ar-SA")}</p>
            </div>
          </div>
        )}
      </div>

      {/* What you'll learn */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h2 className="font-bold mb-4">ماذا ستتعلمين</h2>
        <div className="flex flex-col gap-3">
          {[
            "تقنيات تحليل السوق العملية",
            "إدارة المخاطر وتحديد حجم المراكز",
            "استراتيجيات الدخول والخروج",
            "بناء نظام التداول الخاص بك",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Book button */}
      {course.seatsAvailable === 0 ? (
        <div className="w-full py-3.5 rounded-full bg-muted text-muted-foreground text-center font-medium text-sm">
          الكورس ممتلئ
        </div>
      ) : (
        <button
          onClick={handleBook}
          disabled={bookMutation.isPending}
          className="w-full bg-primary text-white py-3.5 rounded-full font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-60"
          data-testid="button-book-course"
        >
          {bookMutation.isPending ? "جاري الحجز..." : user ? "✦ احجزي الآن" : "✦ سجّلي للحجز"}
        </button>
      )}
    </div>
  );
}
