"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigError } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessionState, setSessionState] = useState({
    user: null,
    session: null,
    loading: Boolean(supabase),
    error: null,
  });

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSessionState({ user: session?.user ?? null, session, loading: false, error: null });
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        setSessionState({
          user: data.session?.user ?? null,
          session: data.session,
          loading: false,
          error: error?.message ?? null,
        });
      })
      .catch((error) => {
        if (!active) return;
        setSessionState({ user: null, session: null, loading: false, error: error.message });
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ ...sessionState, configurationError: supabaseConfigError }),
    [sessionState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}