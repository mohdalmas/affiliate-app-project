"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  // size="sm" — its one call site is the admin header, which is already
  // sharing that row with a hamburger, the logo, and the account email.
  return (
    <Button size="sm" onClick={logout}>
      Logout
    </Button>
  );
}
