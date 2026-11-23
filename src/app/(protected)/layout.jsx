import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabaseServer.js";
import AppShell from "../../components/common/AppShell.jsx";

export default async function ProtectedLayout({ children }) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/login");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
