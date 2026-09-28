import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/features/auth";
import { getServerSession } from "@/server/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only rounded-b-lg px-4 py-2 text-center text-sm font-medium focus:not-sr-only focus:absolute focus:z-50 focus:outline-none"
      >
        Saltar al contenido principal
      </a>
      <header className="border-border flex items-center justify-between gap-4 border-b py-4">
        <Link
          href="/home"
          className="focus-visible:ring-primary rounded font-semibold transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
        >
          Mini Wallet
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">{session.user.fullName}</span>
          <LogoutButton />
        </div>
      </header>
      <main id="main-content" className="flex-1 py-6" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
