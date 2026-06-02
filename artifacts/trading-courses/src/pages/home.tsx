import { Link } from "wouter";
import { useGetCourses, getGetCoursesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Users, Clock, ChevronRight, BarChart2, Award, BookOpen } from "lucide-react";

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function Home() {
  const { data: courses } = useGetCourses({ query: { queryKey: getGetCoursesQueryKey() } });
  const featured = courses?.slice(0, 3) ?? [];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-5xl relative text-center">
          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 rounded-full px-4 py-1.5 text-xs font-medium text-primary mb-8 uppercase tracking-widest">
            <TrendingUp className="h-3 w-3" />
            Professional Trading Education
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Master the Markets with{" "}
            <span className="text-primary">Maryam Alghwari</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Structured trading courses designed for real-world markets. From fundamentals to advanced strategies — learn with clarity and confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base px-8" data-testid="button-browse-courses">
              <Link href="/courses">Browse Courses <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8" data-testid="button-get-started">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/40">
        <div className="container mx-auto max-w-5xl px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: BookOpen, label: "Courses Available", value: "6+" },
            { icon: Users, label: "Students Enrolled", value: "200+" },
            { icon: Award, label: "Completion Rate", value: "94%" },
            { icon: BarChart2, label: "Years Experience", value: "10+" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="h-5 w-5 text-primary mb-1" />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-primary uppercase tracking-widest mb-2 font-medium">Current Programs</p>
              <h2 className="text-3xl font-bold">Featured Courses</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="link-view-all-courses">
              <Link href="/courses">View all <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} data-testid={`card-course-${course.id}`}>
                <div className="border border-border rounded-lg p-6 bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 group cursor-pointer h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${levelColors[course.level]}`}>
                      {course.level}
                    </span>
                    <span className="text-lg font-bold text-primary">${course.price}</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1 line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.seatsAvailable} seats left</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-card/20 border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs text-primary uppercase tracking-widest mb-2 font-medium">Simple Process</p>
            <h2 className="text-3xl font-bold">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Users, title: "Create an Account", desc: "Register in seconds and gain access to the full course catalog." },
              { step: "02", icon: BookOpen, title: "Choose Your Course", desc: "Browse courses by level — beginner, intermediate, or advanced." },
              { step: "03", icon: TrendingUp, title: "Start Learning", desc: "Book your spot and begin your journey toward trading mastery." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold text-primary/60">{step}</span>
                </div>
                <h3 className="font-semibold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs text-primary uppercase tracking-widest mb-2 font-medium">Why ALGHWARI</p>
            <h2 className="text-3xl font-bold">Built for Serious Traders</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Shield, title: "Risk-First Approach", desc: "Every course embeds risk management at its core — because capital preservation comes before profit." },
              { icon: BarChart2, title: "Live Market Context", desc: "Theory meets practice. Sessions are grounded in real market conditions, not textbook examples." },
              { icon: Award, title: "Structured Curriculum", desc: "Clear progression from foundational knowledge to advanced execution strategies." },
              { icon: TrendingUp, title: "All Market Types", desc: "Forex, crypto, options, and derivatives — build versatility across multiple asset classes." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 rounded-lg border border-border bg-card/40 hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="border border-primary/20 rounded-2xl bg-primary/5 p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Trade with Confidence?</h2>
            <p className="text-muted-foreground mb-8">Join hundreds of students who have transformed their approach to the markets.</p>
            <Button asChild size="lg" className="px-10" data-testid="button-cta-register">
              <Link href="/register">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span>© 2026 Maryam Alghwari Trading Academy. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/courses" className="hover:text-foreground transition-colors">Courses</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
