import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlobalSearch } from "@/components/layout/global-search";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export async function Topbar() {
  const user = await getCurrentUser();
  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-sm md:px-6">
      <div className="flex-1">
        <GlobalSearch />
      </div>
      <ThemeToggle />
      <Link
        href="/settings"
        className="flex items-center gap-2.5"
        title={user.name}
      >
        <Avatar>
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="hidden leading-tight sm:block">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-muted-foreground text-xs">{user.title}</div>
        </div>
      </Link>
    </header>
  );
}
