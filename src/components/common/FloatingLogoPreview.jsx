"use client";

import { useEffect, useRef, useState } from "react";

const logoUrl = "/aven-orbit-logo.html";

export default function FloatingLogoPreview() {
  const [expanded, setExpanded] = useState(false);
  const triggerRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (!expanded) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setExpanded(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    previewRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (document.activeElement === previewRef.current) triggerRef.current?.focus();
    };
  }, [expanded]);

  return (
    <>
      <button
        ref={triggerRef}
        className="floating-logo-trigger"
        type="button"
        aria-label="Preview the animated AVEN logo"
        aria-expanded={expanded}
        onClick={() => setExpanded(true)}
      >
        <iframe className="floating-logo-frame" src={logoUrl} title="Animated AVEN logo" tabIndex={-1} />
        <span>AVEN</span>
      </button>

      {expanded && (
        <div
          className="logo-preview-backdrop"
          onClick={() => setExpanded(false)}
          role="presentation"
        >
          <div
            ref={previewRef}
            className="logo-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Animated AVEN logo preview. Click anywhere or press Escape to return it to the corner."
            tabIndex={-1}
          >
            <iframe className="logo-preview-frame" src={logoUrl} title="Large animated AVEN logo preview" tabIndex={-1} />
            <span className="logo-preview-hint">Click anywhere to return</span>
          </div>
        </div>
      )}
    </>
  );
}
