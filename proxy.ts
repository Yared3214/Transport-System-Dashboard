import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "./lib/supabase/server-client";
import { supabase } from "./lib/supabase/client";
/**
 * Next.js proxy (formerly middleware) entry point responsible for basic auth gating.
 *
 * Runtime assumptions due to conflicting docs (Next.js 16):
 * - Proxy runs in the Node.js runtime by default (not Edge)
 * - Node runtime grants access to the shared cookie store used by Supabase
 *
 * What happens per request:
 * - Instantiate the Supabase server client (shares cookies via `NextResponse`)
 * - Call `supabase.auth.getUser()` which refreshes tokens if necessary
 * - Redirect anonymous users away from `/protected` routes to `/login`
 *
 * Add extra path checks or redirects here when you need more complex routing rules.
 */
export async function proxy(request: NextRequest) {

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // catches .png, .js, .css, .woff2
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  const supabaseServerClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServerClient.auth.getUser();

  if (!user) {
    // Only redirect to auth if they are trying to hit a protected page
    const isAuthPage = pathname.startsWith('/auth');
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    return response;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_approved')
    .eq('id', user.id)
    .single();

    const isApproved = profile?.is_approved === true;
    const isWaitingRoom = pathname === "/auth/waiting-room";
  
    // If logged in but NOT approved: force them to stay in the waiting room
    if (!isApproved && !isWaitingRoom) {
      return NextResponse.redirect(new URL("/auth/waiting-room", request.url));
    }
  
    // If logged in AND approved: don't let them see auth or waiting room
    if (isApproved && (isWaitingRoom || pathname.startsWith('/auth'))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  
  return response;
}