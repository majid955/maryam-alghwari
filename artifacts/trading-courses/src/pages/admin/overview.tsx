import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { BookOpen, Users, CheckCircle, Clock, XCircle, TrendingUp, ChevronRight } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function AdminOverview() {
  const { data: stats, isLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10">
        <p className="text-xs text-primary uppercase tracking-widest mb-2 font-medium">Admin Panel</p>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1">Platform health at a glance.</p>
      </div>

      {/* Admin Nav */}
      <div className="flex gap-2 mb-10">
        {[
          { href: "/admin", label: "Overview" },
          { href: "/admin/courses", label: "Courses" },
          { href: "/admin/bookings", label: "Bookings" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
            data-testid={`link-admin-${label.toLowerCase()}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: BookOpen, label: "Total Courses", value: stats?.totalCourses ?? 0, sub: `${stats?.publishedCourses ?? 0} published` },
              { icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0, sub: "registered accounts" },
              { icon: TrendingUp, label: "Total Bookings", value: stats?.totalBookings ?? 0, sub: "all time" },
              { icon: CheckCircle, label: "Confirmed", value: stats?.confirmedBookings ?? 0, sub: `${stats?.pendingBookings ?? 0} pending` },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="border border-border rounded-lg bg-card p-5" data-testid={`stat-${label.toLowerCase().replace(/ /g, "-")}`}>
                <Icon className="h-4 w-4 text-primary mb-3" />
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs font-medium mt-0.5">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {/* Booking breakdown */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Clock, label: "Pending", value: stats?.pendingBookings ?? 0, color: "text-amber-400" },
              { icon: CheckCircle, label: "Confirmed", value: stats?.confirmedBookings ?? 0, color: "text-emerald-400" },
              { icon: XCircle, label: "Cancelled", value: stats?.cancelledBookings ?? 0, color: "text-rose-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="border border-border rounded-lg bg-card p-5 flex items-center gap-4">
                <Icon className={`h-8 w-8 ${color}`} />
                <div>
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-sm text-muted-foreground">{label} bookings</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          {(stats?.recentBookings?.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Bookings</h2>
                <Link href="/admin/bookings" className="text-xs text-primary hover:underline flex items-center gap-1" data-testid="link-all-bookings">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/60">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Course</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentBookings.map((b, i) => (
                      <tr key={b.id} className={`${i < (stats.recentBookings.length - 1) ? "border-b border-border" : ""} hover:bg-card/50 transition-colors`} data-testid={`row-booking-${b.id}`}>
                        <td className="px-4 py-3 font-medium">{b.user.name}</td>
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[180px]">{b.course.title}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColors[b.status]}`}>{b.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
