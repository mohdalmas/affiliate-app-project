import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from "../tracking/session";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Stage 10: only /admin is admin-only. Everything else (the public
  // product/collection pages, /go/[slug], /auth/*, /privacy, etc.) is
  // reachable without logging in — a Meta ad has to be able to land a
  // stranger on these pages. This replaced an earlier "block everything
  // except a few paths" rule that would have 404'd every real visitor at
  // the login screen; see ARCHITECTURE.md's cautions.
  let response = supabaseResponse;
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    response = NextResponse.redirect(url);
  }

  // Stage 11: every visitor (logged in or not) gets a stable anonymous
  // session id, so a click on /go/[slug] can be tied back to the page
  // views that led up to it. Not a login, not tied to an identity — just
  // a random id in a cookie, the same way most analytics tools work.
  if (!request.cookies.get(SESSION_COOKIE_NAME)) {
    response.cookies.set(SESSION_COOKIE_NAME, crypto.randomUUID(), {
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is
  // (or a response built from it, with its cookies preserved, as above).
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return response;
}
