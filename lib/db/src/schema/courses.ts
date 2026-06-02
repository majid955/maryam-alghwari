import { pgTable, serial, text, timestamp, boolean, numeric, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const courseLevelEnum = pgEnum("course_level", ["beginner", "intermediate", "advanced"]);

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: courseLevelEnum("level").notNull(),
  duration: text("duration").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  seats: integer("seats").notNull(),
  seatsAvailable: integer("seats_available").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  published: boolean("published").notNull().default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
