import { useParams, useLocation } from "wouter";
import { useGetCourse, getGetCourseQueryKey, useCreateBooking, useGetMe, getGetMeQueryKey, getGetMyBookingsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, Calendar, ChevronLeft, CheckCircle } from "lucide-react";

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-400 border-rose-500/20",
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
          toast({ title: "Booking confirmed", description: "Your booking is pending confirmation from the admin." });
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          toast({ title: "Booking failed", description: err?.data?.error ?? "Could not book this course.", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-24 w-full mb-8" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 text-center text-muted-foreground">
        Course not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <button
        onClick={() => setLocation("/courses")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        data-testid="button-back-to-courses"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Courses
      </button>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${levelColors[course.level]}`}>
              {course.level}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-muted-foreground leading-relaxed mb-8">{course.description}</p>

          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Course Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Clock, label: "Duration", value: course.duration },
              { icon: Users, label: "Seats Available", value: `${course.seatsAvailable} of ${course.seats}` },
              ...(course.startDate ? [{ icon: Calendar, label: "Start Date", value: new Date(course.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }] : []),
              ...(course.endDate ? [{ icon: Calendar, label: "End Date", value: new Date(course.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }] : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card/50">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">What You Will Learn</h2>
            <div className="space-y-2">
              {["Practical market analysis techniques", "Risk management and position sizing", "Entry and exit strategy frameworks", "Psychology and discipline for consistent performance"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="md:col-span-1">
          <div className="border border-border rounded-lg bg-card p-6 sticky top-24">
            <div className="text-3xl font-bold text-primary mb-1">${course.price}</div>
            <p className="text-xs text-muted-foreground mb-6">One-time enrollment fee</p>

            {course.seatsAvailable === 0 ? (
              <div className="text-center py-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                Fully Booked
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleBook}
                disabled={bookMutation.isPending}
                data-testid="button-book-course"
              >
                {bookMutation.isPending ? "Booking..." : user ? "Book This Course" : "Login to Book"}
              </Button>
            )}

            <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level</span>
                <span className="capitalize font-medium">{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats left</span>
                <span className="font-medium">{course.seatsAvailable}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
