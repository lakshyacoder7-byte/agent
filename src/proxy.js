import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import {
  getSupabaseConfigError,
  supabasePublishableKey,
  supabaseUrl,
} from "./lib/supabaseConfig.js";

export async function proxy(request) {
  if (getSupabaseConfigError()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|aven-intro.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
