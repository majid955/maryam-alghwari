import { Link, useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, TerminalSquare } from "lucide-react";
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
      }
    });
  };

  const NavLinks = () => (
    <>
      <Link href="/courses" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>
        Courses
      </Link>
      {user && user.role === 'admin' && (
        <Link href="/admin" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'}`}>
          Admin Panel
        </Link>
      )}
      {user && user.role === 'user' && (
        <Link href="/dashboard" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}>
          Dashboard
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <TerminalSquare className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block text-lg tracking-tight uppercase">ALGHWARI</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <NavLinks />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{user.name}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Login</Link>
                  <Button asChild size="sm">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )
            )}
          </div>
          
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
          <NavLinks />
          <div className="h-px bg-border my-2" />
          {!isLoading && (
            user ? (
              <div className="flex flex-col gap-4">
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <Button variant="outline" onClick={handleLogout} className="w-full justify-start">Logout</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
