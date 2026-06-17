"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Loader2, LayoutDashboard, Timer, KanbanSquare, Layers, NotebookPen, Trophy } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import AmbientPlayer from "@/components/AmbientPlayer";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/lib/auth";

const mobileLinks = [
  { href: "/dashboard", icon: LayoutDashboard },
  { href: "/dashboard/timer", icon: Timer },
  { href: "/dashboard/tasks", icon: KanbanSquare },
  { href: "/dashboard/flashcards", icon: Layers },
  { href: "/dashboard/notes", icon: NotebookPen },
  { href: "/dashboard/achievements", icon: Trophy },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin text-violet" size={32} />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-5 pb-28 pt-6 md:px-10 md:pb-10">
        <div className="mx-auto mb-4 flex max-w-6xl items-center justify-end">
          <NotificationBell />
        </div>
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-white/10 py-3 md:hidden">
        {mobileLinks.map((l) => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href} className={active ? "text-violet-soft" : "text-white/50"}>
              <l.icon size={22} />
            </Link>
          );
        })}
      </nav>

      <AmbientPlayer />
    </div>
  );
}
