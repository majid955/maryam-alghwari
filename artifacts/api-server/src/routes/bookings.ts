import { Router } from "express";
import { db, bookingsTable, coursesTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function formatBooking(
  b: typeof bookingsTable.$inferSelect,
  course: typeof coursesTable.$inferSelect,
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
  };
}

router.get("/bookings", requireAuth, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(bookingsTable)
      .innerJoin(coursesTable, eq(bookingsTable.courseId, coursesTable.id))
      .where(eq(bookingsTable.userId, req.session.userId!))
      .orderBy(bookingsTable.createdAt);

    res.json(rows.map((r) => formatBooking(r.bookings, r.courses)));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bookings", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.session.userId!;

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
    if (!course) {
      res.status(400).json({ error: "Course not found" });
      return;
    }
    if (!course.published) {
      res.status(400).json({ error: "Course is not available" });
      return;
    }
    if (course.seatsAvailable <= 0) {
      res.status(400).json({ error: "No seats available" });
      return;
    }

    const existing = await db
      .select()
      .from(bookingsTable)
      .where(and(eq(bookingsTable.courseId, courseId), eq(bookingsTable.userId, userId)))
      .limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "You have already booked this course" });
      return;
    }

    const [booking] = await db
      .insert(bookingsTable)
      .values({ courseId, userId, status: "pending" })
      .returning();

    await db
      .update(coursesTable)
      .set({ seatsAvailable: sql`${coursesTable.seatsAvailable} - 1` })
      .where(eq(coursesTable.id, courseId));

    const [updatedCourse] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
    res.status(201).json(formatBooking(booking, updatedCourse));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bookings/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.session.userId!;

    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(and(eq(bookingsTable.id, id), eq(bookingsTable.userId, userId)))
      .limit(1);

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    await db.delete(bookingsTable).where(eq(bookingsTable.id, id));

    if (booking.status !== "cancelled") {
      await db
        .update(coursesTable)
        .set({ seatsAvailable: sql`${coursesTable.seatsAvailable} + 1` })
        .where(eq(coursesTable.id, booking.courseId));
    }

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
