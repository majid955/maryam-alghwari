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

const levelLabels: Record<string, string> = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };

const courseSchema = z.object({
  title: z.string().min(3, "3 أحرف على الأقل"),
  description: z.string().min(10, "10 أحرف على الأقل"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.string().min(1, "مطلوب"),
  price: z.coerce.number().min(0, "مطلوب"),
  seats: z.coerce.number().int().min(1, "مقعد واحد على الأقل"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  published: z.boolean(),
});

type CourseFormData = z.infer<typeof courseSchema>;

type Course = {
  id: number; title: string; description: string; level: string;
  duration: string; price: number; seats: number; seatsAvailable: number;
  startDate: string | null; endDate: string | null; published: boolean;
  imageUrl: string | null; createdAt: string;
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
          onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminCoursesQueryKey() }); toast({ title: "تم تحديث الكورس" }); setOpen(false); },
          onError: () => toast({ title: "خطأ", variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminCoursesQueryKey() }); toast({ title: "تم إنشاء الكورس" }); setOpen(false); },
          onError: () => toast({ title: "خطأ", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`هل أنتِ متأكدة من حذف "${title}"؟`)) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminCoursesQueryKey() }); toast({ title: "تم حذف الكورس" }); },
        onError: () => toast({ title: "خطأ", variant: "destructive" }),
      }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="mb-6">
        <p className="text-xs tracking-[0.3em] uppercase text-primary font-medium mb-1">ADMIN</p>
        <h1 className="text-2xl font-extrabold">إدارة الكورسات</h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ href: "/admin", label: "الرئيسية" }, { href: "/admin/courses", label: "الكورسات" }, { href: "/admin/bookings", label: "الحجوزات" }].map(({ href, label }) => (
          <Link key={href} href={href} className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors">
            {label}
          </Link>
        ))}
      </div>

      <div className="flex justify-start mb-5">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
          data-testid="button-add-course"
        >
          <Plus className="h-4 w-4" /> إضافة كورس
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {(courses ?? []).map((c) => (
            <div key={c.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3" data-testid={`row-course-${c.id}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm truncate">{c.title}</span>
                  {c.published
                    ? <span className="flex items-center gap-1 text-xs text-emerald-600 shrink-0"><Eye className="h-3 w-3" />منشور</span>
                    : <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0"><EyeOff className="h-3 w-3" />مسودة</span>}
                </div>
                <div className="text-xs text-muted-foreground">{levelLabels[c.level]} · ${c.price} · {c.seatsAvailable}/{c.seats} مقعد</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(c as Course)} className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors" data-testid={`button-edit-course-${c.id}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(c.id, c.title)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors" data-testid={`button-delete-course-${c.id}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editCourse ? "تعديل الكورس" : "كورس جديد"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>العنوان</FormLabel><FormControl><Input data-testid="input-course-title" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>الوصف</FormLabel><FormControl><Textarea rows={3} data-testid="input-course-description" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="level" render={({ field }) => (
                  <FormItem><FormLabel>المستوى</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger data-testid="select-course-level"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">مبتدئ</SelectItem>
                        <SelectItem value="intermediate">متوسط</SelectItem>
                        <SelectItem value="advanced">متقدم</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem><FormLabel>المدة</FormLabel><FormControl><Input placeholder="مثال: 4 أسابيع" data-testid="input-course-duration" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>السعر ($)</FormLabel><FormControl><Input type="number" min={0} data-testid="input-course-price" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="seats" render={({ field }) => (
                  <FormItem><FormLabel>عدد المقاعد</FormLabel><FormControl><Input type="number" min={1} data-testid="input-course-seats" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem><FormLabel>تاريخ البدء</FormLabel><FormControl><Input type="date" data-testid="input-course-start-date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem><FormLabel>تاريخ الانتهاء</FormLabel><FormControl><Input type="date" data-testid="input-course-end-date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="published" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <FormLabel className="mb-0">نشر الكورس</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-course-published" /></FormControl>
                </FormItem>
              )} />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-course">{isPending ? "جاري الحفظ..." : "حفظ الكورس"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
