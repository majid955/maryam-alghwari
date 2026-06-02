import { useGetAdminBookings, getGetAdminBookingsQueryKey, useUpdateBookingStatus } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  cancelled: "ملغي",
};

export default function AdminBookings() {
  const { data: bookings, isLoading } = useGetAdminBookings({ query: { queryKey: getGetAdminBookingsQueryKey() } });
  const updateStatus = useUpdateBookingStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate(
      { id, data: { status: status as any } },
      {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminBookingsQueryKey() }); toast({ title: "تم تحديث الحالة" }); },
        onError: () => toast({ title: "خطأ في التحديث", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="mb-6">
        <p className="text-xs tracking-[0.3em] uppercase text-primary font-medium mb-1">ADMIN</p>
        <h1 className="text-2xl font-extrabold">إدارة الحجوزات</h1>
        <p className="text-muted-foreground text-sm mt-1">مراجعة وتأكيد حجوزات الطلاب</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ href: "/admin", label: "الرئيسية" }, { href: "/admin/courses", label: "الكورسات" }, { href: "/admin/bookings", label: "الحجوزات" }].map(({ href, label }) => (
          <Link key={href} href={href} className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors">
            {label}
          </Link>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : (bookings ?? []).length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground">
          لا توجد حجوزات بعد
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(bookings ?? []).map((b) => (
            <div key={b.id} className="bg-card rounded-2xl border border-border p-4" data-testid={`row-admin-booking-${b.id}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{b.user.name}</p>
                  <p className="text-xs text-muted-foreground">{b.user.email}</p>
                  <p className="text-xs text-foreground mt-1 truncate">{b.course.title}</p>
                </div>
                <div className="shrink-0">
                  <Select value={b.status} onValueChange={(val) => handleStatusChange(b.id, val)}>
                    <SelectTrigger className={`w-36 h-8 text-xs border rounded-full ${statusColors[b.status]}`} data-testid={`select-booking-status-${b.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد المراجعة</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(b.createdAt).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span className="text-xs font-bold text-primary">${b.course.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
