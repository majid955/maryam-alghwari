import { useGetMyBookings, getGetMyBookingsQueryKey, useCancelBooking, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, Calendar, X } from "lucide-react";
import { Link } from "wouter";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
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
          toast({ title: "Booking cancelled", description: "Your booking has been cancelled." });
        },
        onError: () => {
          toast({ title: "Error", description: "Could not cancel booking.", variant: "destructive" });
        },
      }
    );
  };

  const active = bookings?.filter((b) => b.status !== "cancelled") ?? [];
  const cancelled = bookings?.filter((b) => b.status === "cancelled") ?? [];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10">
        <p className="text-xs text-primary uppercase tracking-widest mb-2 font-medium">My Account</p>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user && <p className="text-muted-foreground mt-1">Welcome back, {user.name}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Bookings", value: bookings?.length ?? 0 },
          { label: "Confirmed", value: bookings?.filter((b) => b.status === "confirmed").length ?? 0 },
          { label: "Pending", value: bookings?.filter((b) => b.status === "pending").length ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border rounded-lg bg-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : active.length === 0 && cancelled.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground mb-4">You have no bookings yet.</p>
          <Button asChild size="sm" data-testid="button-browse-courses">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Active Bookings</h2>
              <div className="space-y-3">
                {active.map((booking) => (
                  <div key={booking.id} className="border border-border rounded-lg bg-card p-5 flex items-start justify-between gap-4" data-testid={`card-booking-${booking.id}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{booking.course.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize shrink-0 ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{booking.course.duration}</span>
                        <span className="flex items-center gap-1 capitalize">{booking.course.level}</span>
                        {booking.course.startDate && (
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(booking.course.startDate).toLocaleDateString("en-GB")}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-bold text-primary">${booking.course.price}</span>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelMutation.isPending}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Cancel booking"
                        data-testid={`button-cancel-booking-${booking.id}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cancelled.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Cancelled</h2>
              <div className="space-y-3 opacity-60">
                {cancelled.map((booking) => (
                  <div key={booking.id} className="border border-border rounded-lg bg-card p-5 flex items-start justify-between gap-4" data-testid={`card-booking-cancelled-${booking.id}`}>
                    <div>
                      <h3 className="font-medium text-sm">{booking.course.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                    <span className="font-bold text-muted-foreground text-sm">${booking.course.price}</span>
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
