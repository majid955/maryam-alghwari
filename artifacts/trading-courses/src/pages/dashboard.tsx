import { useGetMyBookings, getGetMyBookingsQueryKey, useCancelBooking, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { X, Calendar, Clock } from "lucide-react";
import { Link } from "wouter";

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function Dashboard() {
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const { data: bookings, isLoading } = useGetMyBookings({ query: { queryKey: getGetMyBookingsQueryKey() } });
  const cancelMutation = useCancelBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCancel = (id: number) => {
    cancelMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyBookingsQueryKey() });
          toast({ title: "تم إلغاء الحجز" });
        },
        onError: () => {
          toast({ title: "خطأ", description: "تعذّر إلغاء الحجز.", variant: "destructive" });
        },
      }
    );
  };

  const active = bookings?.filter((b) => b.status !== "cancelled") ?? [];
  const cancelled = bookings?.filter((b) => b.status === "cancelled") ?? [];

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-primary font-medium mb-1">MY ACCOUNT</p>
        <h1 className="text-2xl font-extrabold">حجوزاتي</h1>
        {user && <p className="text-muted-foreground text-sm mt-1">أهلاً، {user.name}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "إجمالي الحجوزات", value: bookings?.length ?? 0 },
          { label: "مؤكدة", value: bookings?.filter((b) => b.status === "confirmed").length ?? 0 },
          { label: "قيد المراجعة", value: bookings?.filter((b) => b.status === "pending").length ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-xl font-bold text-primary">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : active.length === 0 && cancelled.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground mb-4 text-sm">لا توجد حجوزات بعد</p>
          <Link href="/courses" className="inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity" data-testid="button-browse-courses">
            تصفح الكورسات
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {active.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">الحجوزات النشطة</p>
              <div className="flex flex-col gap-3">
                {active.map((booking) => (
                  <div key={booking.id} className="bg-card rounded-2xl border border-border p-5" data-testid={`card-booking-${booking.id}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm leading-tight">{booking.course.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelMutation.isPending}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                            data-testid={`button-cancel-${booking.id}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{booking.course.duration}</span>
                      {booking.course.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(booking.course.startDate).toLocaleDateString("ar-SA")}
                        </span>
                      )}
                      <span className="font-bold text-primary mr-auto">${booking.course.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cancelled.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">الملغية</p>
              <div className="flex flex-col gap-3 opacity-60">
                {cancelled.map((booking) => (
                  <div key={booking.id} className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{booking.course.title}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors.cancelled}`}>ملغي</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
