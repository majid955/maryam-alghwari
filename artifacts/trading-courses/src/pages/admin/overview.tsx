import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { BookOpen, Users, ShoppingBag, CheckCircle, Clock, XCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AdminOverview() {
  const { data: stats, isLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-primary font-medium mb-1">ADMIN</p>
        <h1 className="text-2xl font-extrabold">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm mt-1">نظرة عامة على المنصة</p>
      </div>

      {/* Admin Nav */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[
          { href: "/admin", label: "الرئيسية" },
          { href: "/admin/courses", label: "الكورسات" },
          { href: "/admin/bookings", label: "الحجوزات" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
            data-testid={`link-admin-${href.split("/").pop()}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: BookOpen, label: "إجمالي الكورسات", value: stats?.totalCourses ?? 0, sub: `${stats?.publishedCourses ?? 0} منشور`, color: "text-primary" },
              { icon: Users, label: "المستخدمون", value: stats?.totalUsers ?? 0, sub: "حساب مسجل", color: "text-emerald-600" },
              { icon: ShoppingBag, label: "إجمالي الحجوزات", value: stats?.totalBookings ?? 0, sub: "كل الوقت", color: "text-amber-600" },
              { icon: CheckCircle, label: "مؤكدة", value: stats?.confirmedBookings ?? 0, sub: `${stats?.pendingBookings ?? 0} قيد المراجعة`, color: "text-blue-600" },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <div key={label} className="bg-card rounded-2xl border border-border p-4" data-testid={`stat-${label}`}>
                <Icon className={`h-4 w-4 ${color} mb-2`} />
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs font-medium mt-0.5">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {/* Booking breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Clock, label: "قيد المراجعة", value: stats?.pendingBookings ?? 0, color: "text-amber-600" },
              { icon: CheckCircle, label: "مؤكدة", value: stats?.confirmedBookings ?? 0, color: "text-emerald-600" },
              { icon: XCircle, label: "ملغية", value: stats?.cancelledBookings ?? 0, color: "text-rose-600" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-1">
                <Icon className={`h-5 w-5 ${color}`} />
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          {(stats?.recentBookings?.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">آخر الحجوزات</p>
                <Link href="/admin/bookings" className="text-xs text-primary hover:underline" data-testid="link-all-bookings">
                  عرض الكل ←
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {stats?.recentBookings.map((b) => (
                  <div key={b.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-3" data-testid={`row-booking-${b.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{b.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.course.title}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border shrink-0 ${statusColors[b.status]}`}>
                      {b.status === "pending" ? "قيد المراجعة" : b.status === "confirmed" ? "مؤكد" : "ملغي"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
