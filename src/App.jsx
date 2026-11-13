import { useEffect, useState } from "react";

const Icon = ({ name, size = 19 }) => {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></>,
    feed: <><path d="M4 5h16M4 12h16M4 19h10"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [feed, setFeed] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    Promise.all([
      fetch("/api/feed").then(r => { if (!r.ok) throw new Error("Feed unavailable"); return r.json(); }),
      fetch("/api/dashboard").then(r => { if (!r.ok) throw new Error("Dashboard unavailable"); return r.json(); }),
      fetch("/api/health").then(r => { if (!r.ok) throw new Error("API unavailable"); return r.json(); })
    ]).then(([feedData, dashboardData]) => {
      setFeed(feedData.items || []);
      setMetrics(dashboardData.metrics || []);
      setApiStatus("connected");
    }).catch(() => setApiStatus("offline"));
  }, []);

  return (
    <div className="app-shell">
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb" aria-hidden="true"></div>
          <div className="topbar-right"><div className="top-brand">REVIVE<span>.</span></div></div>
        </header>

        {activeTab === "dashboard" ? (
          <section className="page-content">
            <div className="eyebrow"><span className="eyebrow-line"></span> YOUR OVERVIEW</div>
            <div className="page-heading-row">
              <div><h1>Dashboard<span className="heading-period">.</span></h1><p className="page-subtitle">A clearer view of health, research and the things that matter.</p></div>
              <span className="date-chip"><Icon name="activity" size={15}/> Research workspace</span>
            </div>

            <div className="welcome-panel">
              <div className="welcome-copy"><span className="welcome-kicker">THE REVIVE INITIATIVE</span><h2>Better health begins<br/>with <em>understanding.</em></h2><p>Evidence-led insights for healthier ageing. Your research dashboard is ready for its first data.</p></div>
              <div className="welcome-art" aria-hidden="true"><div className="art-ring ring-one"></div><div className="art-ring ring-two"></div><div className="art-leaf">✳</div><div className="art-label">LIVE<br/>WELL</div></div>
              <div className="welcome-index">01 <span>/ 02</span></div>
            </div>

            <div className="section-title-row"><div><h3>At a glance</h3><p>Key indicators will appear here when data is connected.</p></div><span className="muted-tag">AWAITING DATA</span></div>
            <div className="metric-grid">
              <article className="metric-card"><div className="metric-top"><span>Research records</span><span className="metric-icon"><Icon name="feed"/></span></div><div className="metric-value">—</div><div className="metric-foot">No records added yet</div></article>
              <article className="metric-card"><div className="metric-top"><span>Health indicators</span><span className="metric-icon"><Icon name="activity"/></span></div><div className="metric-value">—</div><div className="metric-foot">Awaiting connected data</div></article>
              <article className="metric-card"><div className="metric-top"><span>People represented</span><span className="metric-icon"><Icon name="users"/></span></div><div className="metric-value">—</div><div className="metric-foot">No participant data</div></article>
              <article className="metric-card"><div className="metric-top"><span>Prevention insights</span><span className="metric-icon"><Icon name="heart"/></span></div><div className="metric-value">—</div><div className="metric-foot">Insights will appear here</div></article>
            </div>

            <div className="lower-grid">
              <article className="surface-card chart-card"><div className="card-heading"><div><h3>Health trends</h3><p>Longitudinal view of selected indicators</p></div><span className="tiny-status">NO DATA</span></div><div className="chart-empty"><div className="chart-placeholder"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><div className="empty-caption">Your trend visualisation will live here</div><small>Connect a dataset to begin exploring trends.</small></div></article>
              <article className="surface-card activity-card"><div className="card-heading"><div><h3>Recent activity</h3><p>Latest updates across REVIVE</p></div><button className="text-action" onClick={() => setActiveTab("feed")}>View feed <Icon name="arrow" size={15}/></button></div><div className="activity-empty"><div className="empty-icon"><Icon name="clock" size={21}/></div><strong>Nothing here just yet</strong><p>New research and updates will show up here.</p></div></article>
            </div>
          </section>
        ) : (
          <section className="page-content">
            <div className="eyebrow"><span className="eyebrow-line"></span> KNOWLEDGE & DISCOVERY</div>
            <div className="page-heading-row"><div><h1>Research feed<span className="heading-period">.</span></h1><p className="page-subtitle">A space for evidence, discoveries and updates that support healthier ageing.</p></div><span className="date-chip"><Icon name="feed" size={15}/> {feed.length} updates</span></div>
            <div className="feed-toolbar"><div><strong>Latest updates</strong><p>Research and data stories, all in one place.</p></div><span className="muted-tag">ALL UPDATES</span></div>
            {feed.length === 0 ? <div className="feed-empty"><div className="feed-empty-visual"><div className="empty-orbit orbit-a"></div><div className="empty-orbit orbit-b"></div><div className="empty-spark">✳</div></div><span className="welcome-kicker">A FRESH START</span><h2>Your feed is taking a breath.</h2><p>There are no updates yet. When research, datasets and new insights are added, they’ll find a home here.</p><span className="feed-empty-foot">GOOD THINGS ARE GROWING <span>✳</span></span></div> : <div className="feed-list">{feed.map(item => <article className="feed-item" key={item.id}><span className="feed-category">{item.category}</span><h3>{item.title}</h3><p>{item.body}</p><small>{new Date(item.createdAt).toLocaleDateString()}</small></article>)}</div>}
          </section>
        )}
        <footer className="footer"><span>© 2026 REVIVE</span><span>AI-POWERED PREVENTIVE HEALTHCARE FOR SENIORS</span><span>LIVE, YOU DESERVE IT.</span></footer>
      </main>
      <nav className="bottom-nav" aria-label="Main navigation">
        <button className={activeTab === "dashboard" ? "bottom-nav-item active" : "bottom-nav-item"} onClick={() => setActiveTab("dashboard")}><Icon name="grid" size={21}/><span>Dashboard</span></button>
        <button className={activeTab === "feed" ? "bottom-nav-item active" : "bottom-nav-item"} onClick={() => setActiveTab("feed")}><Icon name="feed" size={21}/><span>Feed</span></button>
      </nav>
    </div>
  );
}

export default App;
