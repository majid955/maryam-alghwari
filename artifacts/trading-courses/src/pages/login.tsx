import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("أدخلي بريدًا إلكترونيًا صحيحًا"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          queryClient.setQueryData(getGetMeQueryKey(), res.user);
          setLocation(res.user.role === "admin" ? "/admin" : "/dashboard");
        },
        onError: (err: any) => {
          toast({ title: "خطأ في تسجيل الدخول", description: err?.data?.error ?? "البريد أو كلمة المرور غير صحيحة.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-12 flex flex-col items-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-primary font-medium mb-1">C. MARYAM ALGHWARI</p>
          <h1 className="text-2xl font-extrabold">تسجيل الدخول</h1>
          <p className="text-muted-foreground text-sm mt-1">أهلاً بك مجدداً</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@email.com" className="bg-muted/50" data-testid="input-email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="bg-muted/50" data-testid="input-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-primary text-white py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-1"
                data-testid="button-submit-login"
              >
                {loginMutation.isPending ? "جاري الدخول..." : "✦ تسجيل الدخول"}
              </button>
            </form>
          </Form>

          <div className="mt-5 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              أنشئي حسابًا
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
