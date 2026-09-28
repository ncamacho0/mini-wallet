import { redirect } from "next/navigation";
import { getServerSession } from "@/server/lib/auth";

export default async function RootPage() {
  const session = await getServerSession();
  redirect(session ? "/home" : "/login");
}
