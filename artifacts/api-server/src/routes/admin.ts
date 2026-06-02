import { Router } from "express";
import { db, bookingsTable, coursesTable, usersTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function formatAdminBooking(
  b: typeof bookingsTable.$inferSelect,
  course: typeof coursesTable.$inferSelect,
  user: typeof usersTable.$inferSelect,
) {
  return {
    id: b.id,
    courseId: b.courseId,
    userId: b.userId,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      duration: course.duration,
      price: parseFloat(course.price as string),
      seats: course.seats,
      seatsAvailable: course.seatsAvailable,
      startDate: course.startDate ?? null,
      endDate: course.endDate ?? null,
      published: course.published,
      imageUrl: course.imageUrl ?? null,
      createdAt: course.createdAt.toISOString(),
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    },
  };
}

router.get("/admin/bookings", requireAdmin, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(bookingsTable)
      .innerJoin(coursesTable, eq(bookingsTable.courseId, coursesTable.id))
      .innerJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
      .orderBy(bookingsTable.createdAt);

    res.json(rows.map((r) => formatAdminBooking(r.bookings, r.courses, r.users)));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/bookings/:id/status", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const [booking] = await db
      .update(bookingsTable)
      .set({ status })
      .where(eq(bookingsTable.id, id))
      .returning();

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, booking.courseId)).limit(1);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, booking.userId)).limit(1);

    res.json(formatAdminBooking(booking, course, user));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [totalCoursesRow] = await db.select({ count: count() }).from(coursesTable);
    const [publishedCoursesRow] = await db
      .select({ count: count() })
      .from(coursesTable)
      .where(eq(coursesTable.published, true));
    const [totalBookingsRow] = await db.select({ count: count() }).from(bookingsTable);
    const [pendingRow] = await db
      .select({ count: count() })
      .from(bookingsTable)
      .where(eq(bookingsTable.status, "pending"));
    const [confirmedRow] = await db
      .select({ count: count() })
      .from(bookingsTable)
      .where(eq(bookingsTable.status, "confirmed"));
    const [cancelledRow] = await db
      .select({ count: count() })
      .from(bookingsTable)
      .where(eq(bookingsTable.status, "cancelled"));
    const [totalUsersRow] = await db.select({ count: count() }).from(usersTable);

    const recentRows = await db
      .select()
      .from(bookingsTable)
      .innerJoin(coursesTable, eq(bookingsTable.courseId, coursesTable.id))
      .innerJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
      .orderBy(sql`${bookingsTable.createdAt} DESC`)
      .limit(5);

    res.json({
      totalCourses: Number(totalCoursesRow.count),
      publishedCourses: Number(publishedCoursesRow.count),
      totalBookings: Number(totalBookingsRow.count),
      pendingBookings: Number(pendingRow.count),
      confirmedBookings: Number(confirmedRow.count),
      cancelledBookings: Number(cancelledRow.count),
      totalUsers: Number(totalUsersRow.count),
      recentBookings: recentRows.map((r) =>
        formatAdminBooking(r.bookings, r.courses, r.users),
      ),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/courses", requireAdmin, async (req, res) => {
  try {
    const courses = await db.select().from(coursesTable).orderBy(coursesTable.createdAt);
    res.json(
      courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        level: c.level,
        duration: c.duration,
        price: parseFloat(c.price as string),
        seats: c.seats,
        seatsAvailable: c.seatsAvailable,
        startDate: c.startDate ?? null,
        endDate: c.endDate ?? null,
        published: c.published,
        imageUrl: c.imageUrl ?? null,
        createdAt: c.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
