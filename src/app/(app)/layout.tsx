import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

// Everything inside the app shell is per-user and reads live clinical data —
// never prerender it at build time.
export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="md:pl-56">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-20 md:px-6 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
