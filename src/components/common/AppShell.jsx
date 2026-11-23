"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAuthErrorMessage } from "../../features/auth/authErrors.js";
import { signOut } from "../../features/auth/authService.js";
import ThemeToggle from "./ThemeToggle.jsx";
import FloatingLogoPreview from "./FloatingLogoPreview.jsx";

const navigation = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/search", label: "Discover", icon: "search" },
  { href: "/library", label: "Library", icon: "library" },
  { href: "/history", label: "History", icon: "history" },
  { href: "/bookmarks", label: "Bookmarks", icon: "bookmark" },
  { href: "/tools", label: "Tools", icon: "tools" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

function NavigationIcon({ name }) {
  const paths = {
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v11h13V9M9.5 20v-6h5v6" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    library: <><path d="M4 4.5h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    history: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    bookmark: <><path d="M6.5 3.5h11v17l-5.5-3.7-5.5 3.7z" /></>,
    tools: <><path d="M14.5 3.5 20 9l-8.8 8.8a3.2 3.2 0 0 1-4.6-4.6z" /><path d="M7 3.5h3v3H7zM3.5 7h3v3h-3z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.2.9-1.2 2.1-1.4-.5a7.8 7.8 0 0 1-1.7 1l-.2 1.5h-2.4l-.3-1.5a7.8 7.8 0 0 1-1.7-1l-1.4.5-1.2-2.1 1.2-.9a7 7 0 0 1 0-2l-1.2-.9 1.2-2.1 1.4.5a7.8 7.8 0 0 1 1.7-1l.3-1.5h2.4l.2 1.5a7.8 7.8 0 0 1 1.7 1l1.4-.5 1.2 2.1-1.2.9a7 7 0 0 1-.1 2Z" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") setProfileOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  async function handleSignOut() {
    setError("");
    setSigningOut(true);
    try {
      const { error: signOutError } = await signOut();
      if (signOutError) throw signOutError;
      router.replace("/");
    } catch (signOutError) {
      setError(getAuthErrorMessage(signOutError));
      setSigningOut(false);
    }
  }

  const routeIdentity = pathname?.split("/").filter(Boolean)[0] || "home";

  return (
    <div className={`app-shell page-theme-${routeIdentity}`}>
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <FloatingLogoPreview />
        </div>
        <p className="sidebar-caption">KNOWLEDGE WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                className={`sidebar-link${active ? " is-active" : ""}`}
                href={item.href}
                key={item.href}
                aria-current={active ? "page" : undefined}
              >
                <span className="sidebar-icon"><NavigationIcon name={item.icon} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <ThemeToggle />
          <Link className="sidebar-workspace" href="/library">
            <span>Personal workspace</span>
            <strong>Saved sources</strong>
          </Link>
          <Link className="sidebar-account" href="/profile">
            <span className="account-avatar" aria-hidden="true">
              {(user?.user_metadata?.full_name || user?.email || "A").charAt(0).toUpperCase()}
            </span>
            <span className="account-email">{user?.email}</span>
          </Link>
          {error && <p className="shell-error" role="alert">{error}</p>}
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <Link className="topbar-search" href="/search">
            <span aria-hidden="true">⌕</span>
            <span>Search anything…</span>
            <kbd>⌘ K</kbd>
          </Link>
          <div className="topbar-actions">
            <Link className="topbar-history" href="/history" aria-label="Open recent activity">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </Link>
            <ThemeToggle />
            <button className="topbar-profile" type="button" aria-label="Open profile menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}>
              {(user?.user_metadata?.full_name || user?.email || "A").charAt(0).toUpperCase()}
            </button>
            {profileOpen && (
              <div className="profile-menu" role="menu">
                <div className="profile-menu-heading"><strong>{user?.user_metadata?.full_name || "AVEN account"}</strong><span>{user?.email}</span></div>
                <Link href="/profile" role="menuitem" onClick={() => setProfileOpen(false)}>My profile</Link>
                <Link href="/library" role="menuitem" onClick={() => setProfileOpen(false)}>My Library</Link>
                <Link href="/settings" role="menuitem" onClick={() => setProfileOpen(false)}>Settings</Link>
                <Link href="/tools" role="menuitem" onClick={() => setProfileOpen(false)}>Help and tools</Link>
                <button type="button" className="profile-menu-signout" role="menuitem" onClick={handleSignOut} disabled={signingOut}>{signingOut ? "Signing out…" : "Sign out"}</button>
              </div>
            )}
          </div>
        </header>
        {error && <p className="shell-error shell-error--mobile" role="alert">{error}</p>}
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
