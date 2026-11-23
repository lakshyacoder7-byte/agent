"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabaseConfigError,
  supabasePublishableKey,
  supabaseUrl,
} from "./supabaseConfig.js";

export const supabaseConfigError = getSupabaseConfigError();

export const supabase = supabaseConfigError
  ? null
  : createBrowserClient(supabaseUrl, supabasePublishableKey);

export function requireSupabase() {
  if (!supabase) {
    throw new Error(supabaseConfigError);
  }

  return supabase;
}

export async function testSupabaseConnection({ signal } = {}) {
  if (!supabaseUrl || !supabasePublishableKey) {
    return { status: "configuration-missing" };
  }
  if (supabaseConfigError) {
    return { status: "configuration-invalid", message: supabaseConfigError };
  }

  let response;
  try {
    response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: "GET",
      headers: {
        apikey: supabasePublishableKey,
        Accept: "application/json",
      },
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      return { status: "connection-failed", message: "The connection check timed out or was cancelled." };
    }
    return {
      status: "connection-failed",
      message: "Could not reach Supabase. Check the project URL, network, and project availability.",
    };
  }

  if (!response.ok) {
    return {
      status: "connection-failed",
      message: `Supabase returned HTTP ${response.status}. Check the project URL and publishable key.`,
    };
  }

  return { status: "connected" };
}
