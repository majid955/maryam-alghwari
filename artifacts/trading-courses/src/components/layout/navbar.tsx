import { Link, useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: user, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        window.location.href = "/";
      },
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Hamburger — right in RTL (visually left) */}
        <button
          className="text-foreground/70 hover:text-foreground transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="القائمة"
          data-testid="button-menu-toggle"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Brand — left in RTL (visually right) */}
        <Link href="/" className="text-end">
          <div className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none">C. Maryam Alghwari</div>
          <div className="text-lg font-bold leading-tight">مريم الجهوري</div>
        </Link>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background">
          <div className="max-w-2xl mx-auto px-5 py-4 flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location === "/" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
            >
              الرئيسية
            </Link>
            <Link
              href="/courses"
              onClick={() => setIsMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.startsWith("/courses") ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
            >
              الكورسات
            </Link>
            {user?.role === "admin" && (
              <>
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  لوحة التحكم
                </Link>
                <Link href="/admin/courses" onClick={() => setIsMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  إدارة الكورسات
                </Link>
                <Link href="/admin/bookings" onClick={() => setIsMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  إدارة الحجوزات
                </Link>
              </>
            )}
            {user?.role === "user" && (
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                حجوزاتي
              </Link>
            )}

            <div className="h-px bg-border my-1" />

            {!isLoading && (
              user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-muted-foreground">{user.name}</span>
                  <button onClick={handleLogout} className="text-sm text-destructive hover:underline" data-testid="button-logout">
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors" data-testid="link-login">
                    تسجيل الدخول
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)} className="mx-3 mt-1 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-medium text-center" data-testid="link-register">
                    إنشاء حساب
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
