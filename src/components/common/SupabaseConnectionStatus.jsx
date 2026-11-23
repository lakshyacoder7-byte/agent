"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  supabaseConfigError,
  testSupabaseConnection,
} from "../../lib/supabaseClient.js";

const labels = {
  connecting: "Connecting to Supabase…",
  connected: "Connected to Supabase",
  "configuration-missing": "Supabase configuration missing",
  "configuration-invalid": "Supabase configuration invalid",
  "connection-failed": "Supabase connection failed",
};

export default function SupabaseConnectionStatus() {
  const [result, setResult] = useState(() =>
    supabaseConfigError
      ? {
          status: supabaseConfigError.includes("not configured")
            ? "configuration-missing"
            : "configuration-invalid",
        }
      : { status: "connecting" },
  );
  const [attempt, setAttempt] = useState(0);

  const checkConnection = useCallback(async (signal) => {
    if (supabaseConfigError) {
      setResult({
        status: supabaseConfigError.includes("not configured")
          ? "configuration-missing"
          : "configuration-invalid",
        message: supabaseConfigError.includes("not configured") ? undefined : supabaseConfigError,
      });
      return;
    }

    setResult({ status: "connecting" });
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      // Aborting this request bounds the check even if the network is unavailable.
      controller.abort();
    }, 8000);
    const abortFromParent = () => controller.abort();
    signal?.addEventListener("abort", abortFromParent, { once: true });

    try {
      const connection = await testSupabaseConnection({ signal: controller.signal });
      if (!signal?.aborted) setResult(connection);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abortFromParent);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    checkConnection(controller.signal).catch(() => {
      if (!controller.signal.aborted) {
        setResult({
          status: "connection-failed",
          message: "Could not complete the Supabase connection check.",
        });
      }
    });
    return () => controller.abort();
  }, [attempt, checkConnection]);

  const retryable = result.status === "connection-failed";

  return (
    <div className="supabase-status" aria-live="polite">
      <span className={`supabase-status__indicator supabase-status__indicator--${result.status}`} />
      <span>
        <strong>{labels[result.status]}</strong>
        {result.message && <span className="supabase-status__message">{result.message}</span>}
      </span>
      {retryable && (
        <button type="button" className="supabase-status__retry" onClick={() => setAttempt((value) => value + 1)}>
          Retry
        </button>
      )}
    </div>
  );
}
