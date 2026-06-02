import { Router } from "express";
import { db, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function formatCourse(c: typeof coursesTable.$inferSelect) {
  return {
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
  };
}

router.get("/courses", async (req, res) => {
  try {
    const courses = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.published, true))
      .orderBy(coursesTable.createdAt);
    res.json(courses.map(formatCourse));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/courses/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, id)).limit(1);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json(formatCourse(course));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/courses", requireAdmin, async (req, res) => {
  try {
    const { title, description, level, duration, price, seats, startDate, endDate, published, imageUrl } = req.body;
    const [course] = await db
      .insert(coursesTable)
      .values({
        title,
        description,
        level,
        duration,
        price: String(price),
        seats,
        seatsAvailable: seats,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        published: published ?? false,
        imageUrl: imageUrl ?? null,
      })
      .returning();
    res.status(201).json(formatCourse(course));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/courses/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, level, duration, price, seats, startDate, endDate, published, imageUrl } = req.body;

    const updates: Partial<typeof coursesTable.$inferInsert> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (level !== undefined) updates.level = level;
    if (duration !== undefined) updates.duration = duration;
    if (price !== undefined) updates.price = String(price);
    if (seats !== undefined) {
      updates.seats = seats;
      updates.seatsAvailable = seats;
    }
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (published !== undefined) updates.published = published;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;

    const [course] = await db.update(coursesTable).set(updates).where(eq(coursesTable.id, id)).returning();
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json(formatCourse(course));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/courses/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [course] = await db.delete(coursesTable).where(eq(coursesTable.id, id)).returning();
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
