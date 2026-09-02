import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    // Always visible — never `hidden` at any width, so it can't just
    // disappear (or read as "gone behind the button"). `min-w-0` + a
    // progressively wider `max-w-*` is what actually constrains it: the
    // email truncates with an ellipsis instead of pushing the Logout
    // button off-screen or wrapping the header taller.
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="min-w-0 max-w-[92px] sm:max-w-[180px] md:max-w-[260px] truncate text-xs sm:text-sm text-muted-foreground">
        <span className="hidden sm:inline">Hey, </span>
        {user.email}
        <span className="hidden sm:inline">!</span>
      </span>
      <LogoutButton />
    </div>
  ) : (
    // Single-admin app: no public sign-up, so only "Sign in" is shown —
    // see ARCHITECTURE.md ("Admin access") for how the one account is created.
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
    </div>
  );
}
