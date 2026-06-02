import { useState } from "react";
import { useGetAdminCourses, getGetAdminCoursesQueryKey, useCreateCourse, useUpdateCourse, useDeleteCourse } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

const courseSchema = z.object({
  title: z.string().min(3, "Min 3 characters"),
  description: z.string().min(10, "Min 10 characters"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.string().min(1, "Required"),
  price: z.coerce.number().min(0, "Required"),
  seats: z.coerce.number().int().min(1, "Min 1 seat"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  published: z.boolean(),
});

type CourseFormData = z.infer<typeof courseSchema>;

type Course = {
  id: number;
  title: string;
  description: string;
  level: string;
  duration: string;
  price: number;
  seats: number;
  seatsAvailable: number;
  startDate: string | null;
  endDate: string | null;
  published: boolean;
  imageUrl: string | null;
  createdAt: string;
};

export default function AdminCourses() {
  const { data: courses, isLoading } = useGetAdminCourses({ query: { queryKey: getGetAdminCoursesQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { title: "", description: "", level: "beginner", duration: "", price: 0, seats: 20, published: false },
  });

  const openCreate = () => {
    setEditCourse(null);
    form.reset({ title: "", description: "", level: "beginner", duration: "", price: 0, seats: 20, published: false });
    setOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditCourse(c);
    form.reset({
      title: c.title, description: c.description, level: c.level as any,
      duration: c.duration, price: c.price, seats: c.seats,
      startDate: c.startDate ?? "", endDate: c.endDate ?? "", published: c.published,
    });
    setOpen(true);
  };

  const onSubmit = (data: CourseFormData) => {
    const payload = { ...data, startDate: data.startDate || null, endDate: data.endDate || null };
    if (editCourse) {
      updateMutation.mutate(
        { id: editCourse.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetAdminCoursesQueryKey() });
            toast({ title: "Course updated" });
            setOpen(false);
          },
          onError: () => toast({ title: "Error", variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetAdminCoursesQueryKey() });
            toast({ title: "Course created" });
            setOpen(false);
          },
          onError: () => toast({ title: "Error", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAdminCoursesQueryKey() });
          toast({ title: "Course deleted" });
        },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10">
        <p className="text-xs text-primary uppercase tracking-widest mb-2 font-medium">Admin Panel</p>
        <h1 className="text-3xl font-bold">Manage Courses</h1>
      </div>

      <div className="flex gap-2 mb-8">
        {[{ href: "/admin", label: "Overview" }, { href: "/admin/courses", label: "Courses" }, { href: "/admin/bookings", label: "Bookings" }].map(({ href, label }) => (
          <Link key={href} href={href} className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors">
            {label}
          </Link>
        ))}
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={openCreate} size="sm" data-testid="button-add-course">
          <Plus className="h-4 w-4 mr-2" /> Add Course
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/60">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Level</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Seats</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(courses ?? []).map((c, i) => (
                <tr key={c.id} className={`${i < (courses!.length - 1) ? "border-b border-border" : ""} hover:bg-card/50 transition-colors`} data-testid={`row-course-${c.id}`}>
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground hidden md:table-cell">{c.level}</td>
                  <td className="px-4 py-3 text-primary font-semibold hidden md:table-cell">${c.price}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.seatsAvailable}/{c.seats}</td>
                  <td className="px-4 py-3">
                    {c.published
                      ? <span className="flex items-center gap-1 text-xs text-emerald-400"><Eye className="h-3 w-3" />Published</span>
                      : <span className="flex items-center gap-1 text-xs text-muted-foreground"><EyeOff className="h-3 w-3" />Draft</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c as Course)} className="p-1.5 rounded text-muted-foreground hover:text-primary transition-colors" title="Edit" data-testid={`button-edit-course-${c.id}`}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.title)} className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors" title="Delete" data-testid={`button-delete-course-${c.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCourse ? "Edit Course" : "New Course"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-course-title" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} data-testid="input-course-description" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="level" render={({ field }) => (
                  <FormItem><FormLabel>Level</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger data-testid="select-course-level"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="e.g. 4 weeks" data-testid="input-course-duration" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Price ($)</FormLabel><FormControl><Input type="number" min={0} data-testid="input-course-price" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="seats" render={({ field }) => (
                  <FormItem><FormLabel>Seats</FormLabel><FormControl><Input type="number" min={1} data-testid="input-course-seats" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" data-testid="input-course-start-date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" data-testid="input-course-end-date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="published" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <FormLabel className="mb-0">Published</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-course-published" /></FormControl>
                </FormItem>
              )} />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-course">{isPending ? "Saving..." : "Save Course"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
