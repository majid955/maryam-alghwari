import { useGetAdminBookings, getGetAdminBookingsQueryKey, useUpdateBookingStatus } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
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
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAdminBookingsQueryKey() });
          toast({ title: "Status updated" });
        },
        onError: () => toast({ title: "Error updating status", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10">
        <p className="text-xs text-primary uppercase tracking-widest mb-2 font-medium">Admin Panel</p>
        <h1 className="text-3xl font-bold">Manage Bookings</h1>
        <p className="text-muted-foreground mt-1">Review and update all student bookings.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {[{ href: "/admin", label: "Overview" }, { href: "/admin/courses", label: "Courses" }, { href: "/admin/bookings", label: "Bookings" }].map(({ href, label }) => (
          <Link key={href} href={href} className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors">
            {label}
          </Link>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : (bookings ?? []).length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
          No bookings yet.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/60">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Student</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Course</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {(bookings ?? []).map((b, i) => (
                <tr
                  key={b.id}
                  className={`${i < (bookings!.length - 1) ? "border-b border-border" : ""} hover:bg-card/50 transition-colors`}
                  data-testid={`row-admin-booking-${b.id}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.user.name}</div>
                    <div className="text-xs text-muted-foreground">{b.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[180px] truncate">{b.course.title}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={b.status}
                      onValueChange={(val) => handleStatusChange(b.id, val)}
                    >
                      <SelectTrigger className={`w-32 h-7 text-xs border ${statusColors[b.status]}`} data-testid={`select-booking-status-${b.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
