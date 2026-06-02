import { useState } from "react";
import { Link } from "wouter";
import { useGetCourses, getGetCoursesQueryKey, useCreateBooking, useGetMe, getGetMeQueryKey, getGetMyBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const requestSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(9, "رقم الهاتف مطلوب"),
  service: z.string().min(1, "اختاري الخدمة"),
  message: z.string().min(5, "اكتبي رسالتك"),
});
type RequestData = z.infer<typeof requestSchema>;

export default function Home() {
  const { data: courses } = useGetCourses({ query: { queryKey: getGetCoursesQueryKey() } });
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const bookMutation = useCreateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<RequestData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { name: "", phone: "", service: "", message: "" },
  });

  const onSubmit = (_data: RequestData) => {
    setSubmitted(true);
    toast({ title: "تم إرسال طلبك بنجاح", description: "سنتواصل معك في أقرب وقت." });
    form.reset();
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleBook = (courseId: number) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    bookMutation.mutate(
      { data: { courseId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyBookingsQueryKey() });
          toast({ title: "تم الحجز", description: "تم إرسال طلب حجزك بنجاح وسيتم تأكيده قريباً." });
        },
        onError: (err: any) => {
          toast({ title: "خطأ", description: err?.data?.error ?? "تعذّر إتمام الحجز.", variant: "destructive" });
        },
      }
    );
  };

  const featured = (courses ?? []).slice(0, 3);

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full">
      {/* Hero */}
      <section className="px-5 pt-12 pb-8 text-center">
        <p className="text-xs tracking-[0.25em] uppercase text-primary font-medium mb-3">مريم الجهوري</p>
        <h1 className="text-3xl font-extrabold leading-tight mb-4">
          رحلتك المالية تبدأ هنا
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          خدمات مالية حصرية وبرامج تعليمية متخصصة في التداول والاستثمار — مصممة لمن يريد الانتقال إلى مستوى أعلى
        </p>
      </section>

      {/* Services Section */}
      <section className="px-5 pb-10">
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.3em] uppercase text-primary font-medium mb-1">EXCLUSIVE</p>
          <h2 className="text-2xl font-extrabold">الخدمات الخاصة</h2>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            خدمات حصرية مصممة لمن يريد الانتقال إلى مستوى أعلى في رحلته المالية
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Investment Funds Card */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">الصناديق الاستثمارية</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              صناديق استثمارية مدارة باحترافية بعوائد شهرية منتظمة وشفافية كاملة
            </p>
            <Link href="/courses" className="text-primary text-sm font-medium flex items-center gap-1.5 hover:underline">
              ✦ اكتشف الصناديق
            </Link>
          </div>

          {/* Courses Card */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold mb-2">الكورسات والتسجيل</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              برامج تعليمية متخصصة في التداول والاستثمار من الأسس إلى الاحترافية
            </p>
            <Link href="/courses" className="text-primary text-sm font-medium flex items-center gap-1.5 hover:underline">
              ✦ اكتشف الكورسات
            </Link>
          </div>

          {/* 1-on-1 Card */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">الاستشارة الخاصة</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              جلسات فردية مخصصة لتحليل وضعك المالي ووضع خطة استثمارية متكاملة
            </p>
            <button
              onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
              className="text-primary text-sm font-medium flex items-center gap-1.5 hover:underline"
            >
              ✦ احجزي استشارة
            </button>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featured.length > 0 && (
        <section className="px-5 pb-10">
          <div className="text-center mb-6">
            <p className="text-xs tracking-[0.3em] uppercase text-primary font-medium mb-1">COURSES</p>
            <h2 className="text-2xl font-extrabold">الكورسات المتاحة</h2>
          </div>
          <div className="flex flex-col gap-4">
            {featured.map((course) => (
              <div key={course.id} className="bg-card rounded-2xl border border-border p-5 shadow-sm" data-testid={`card-course-${course.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                    {levelLabels[course.level] ?? course.level}
                  </span>
                  <span className="font-bold text-lg text-primary">${course.price}</span>
                </div>
                <h3 className="font-bold text-base mb-1">{course.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{course.duration} · {course.seatsAvailable} مقعد متبقي</span>
                  <Link href={`/courses/${course.id}`} className="text-primary text-xs font-medium hover:underline" data-testid={`link-course-${course.id}`}>
                    التفاصيل ←
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline" data-testid="link-all-courses">
              عرض جميع الكورسات ←
            </Link>
          </div>
        </section>
      )}

      {/* Booking Request Form */}
      <section id="booking-form" className="px-5 pb-14">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-center mb-6">أرسلي طلبك</h2>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-bold text-lg mb-1">تم إرسال طلبك بنجاح</p>
              <p className="text-muted-foreground text-sm">سنتواصل معك في أقرب وقت.</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="اكتبي اسمك هنا" className="bg-muted/50 border-border" data-testid="input-request-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input placeholder="+966 5X XXX XXXX" type="tel" className="bg-muted/50 border-border" data-testid="input-request-phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">نوع الخدمة</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50 border-border" data-testid="select-request-service">
                            <SelectValue placeholder="اختاري الخدمة المناسبة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="investment">الصناديق الاستثمارية</SelectItem>
                          <SelectItem value="courses">الكورسات والتسجيل</SelectItem>
                          <SelectItem value="consulting">الاستشارة الخاصة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">رسالتك</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أخبريني عن هدفك المالي وكيف يمكنني مساعدتك..."
                          rows={4}
                          className="bg-muted/50 border-border resize-none"
                          data-testid="textarea-request-message"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3.5 rounded-full font-bold text-base hover:opacity-90 transition-opacity mt-1"
                  data-testid="button-submit-request"
                >
                  ✦ احجزي الآن
                </button>
              </form>
            </Form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-5 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} مريم الجهوري · جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}
