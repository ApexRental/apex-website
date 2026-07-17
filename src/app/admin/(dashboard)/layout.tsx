import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/fleet", label: "Fleet" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-sm font-bold tracking-[0.18em]">
              APEX{" "}
              <span className="text-xs tracking-[0.42em] text-accent-bright">
                ADMIN
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded px-3 py-1.5 text-sm text-muted transition-colors hover:bg-raised hover:text-fg"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden text-xs text-muted hover:text-fg sm:block"
            >
              View site ↗
            </Link>
            <form action={logoutAction}>
              <button className="rounded border border-line px-3 py-1.5 text-xs text-muted hover:border-accent/50 hover:text-fg">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
