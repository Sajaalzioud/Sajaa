"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Receipt,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r md:flex">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
          <Sparkles className="size-4" />
        </span>
        <div className="leading-tight">
          <div className="text-sidebar-foreground font-semibold">Sajaa</div>
          <div className="text-muted-foreground text-[11px]">
            Pediatric OT Platform
          </div>
        </div>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active &&
                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="text-muted-foreground border-sidebar-border border-t px-5 py-3 text-[11px]">
        HIPAA-ready · Encrypted
      </div>
    </aside>
  );
}

/** Compact bottom navigation for mobile / tablet portrait. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-background/95 fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t py-1.5 backdrop-blur-sm md:hidden">
      {NAV.slice(0, 5).map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-muted-foreground flex flex-col items-center gap-0.5 rounded-md px-3 py-1 text-[10px] font-medium",
              active && "text-primary",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
