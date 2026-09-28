import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth";
import { getServerSession } from "@/server/lib/auth";
import { sanitizeRedirect } from "@/shared/lib/redirect";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const session = await getServerSession();
  if (session) redirect(sanitizeRedirect(params.redirect));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Mini Wallet</h1>
        <p className="text-muted-foreground text-sm">
          Ingresa con tu teléfono o email para continuar.
        </p>
      </div>
      <Suspense fallback={<p className="text-muted-foreground text-sm">Cargando…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
