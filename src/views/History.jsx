import Link from "next/link";

export default function History() {
  return (
    <main className="workspace-page">
      <header className="page-heading">
        <div><p className="eyebrow">YOUR ACTIVITY</p><h1>History</h1><p className="page-lede">Pick up an earlier line of inquiry.</p></div>
        <Link className="button button--secondary" href="/search">Start a search</Link>
      </header>
      <section className="empty-panel">
        <span className="empty-icon" aria-hidden="true">◷</span>
        <h2>No activity yet</h2>
        <p>Your searches will be listed here once search is connected.</p>
        <Link className="text-link" href="/search">Explore a question <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}