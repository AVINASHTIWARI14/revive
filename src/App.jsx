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

function App({ user }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [feed, setFeed] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [apiStatus, setApiStatus] = useState("checking");
  const [selectedReport, setSelectedReport] = useState("");
  const emptyProfile = { name: user?.name || "", age: "", weight: "", height: "", bloodGroup: "", conditions: "", medications: "", allergies: "" };
  const [profile, setProfile] = useState(() => {
    try { return { ...emptyProfile, ...JSON.parse(localStorage.getItem("revive-health-profile") || "{}") }; }
    catch { return emptyProfile; }
  });
  const [profileDraft, setProfileDraft] = useState(profile);
  const [editingProfile, setEditingProfile] = useState(false);
  const bmi = profile.weight && profile.height ? (Number(profile.weight) / ((Number(profile.height) / 100) ** 2)).toFixed(1) : "—";
  const saveProfile = (event) => {
    event.preventDefault();
    const next = { ...profileDraft };
    setProfile(next);
    localStorage.setItem("revive-health-profile", JSON.stringify(next));
    setEditingProfile(false);
  };

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
          <div className="topbar-right"><div className="top-brand">REVIVE</div></div>
        </header>

        {activeTab === "dashboard" ? (
<section className="page-content dashboard-content">
<div className="page-heading-row dashboard-greeting"><div><h1>Feeling good{user?.name ? `, ${user.name}` : ""}?</h1></div></div>
<section className="profile-overview"><div className="profile-avatar"><Icon name="users" size={25}/></div><div className="profile-main"><h2>{profile.name || "Your profile"} <span>·</span> {profile.age ? `Age ${profile.age}` : "Age not added"}</h2><p>{profile.name ? "Your health profile at a glance." : "Add your details to start building your personal health profile."}</p></div><button className="outline-action profile-edit" type="button" onClick={() => { setProfileDraft(profile); setEditingProfile(true); }}>{profile.name || profile.age ? "Edit profile" : "Complete profile"} <Icon name="arrow" size={15}/></button><div className="profile-stats"><div><span>WEIGHT</span><strong>{profile.weight || "—"} <small>kg</small></strong></div><div><span>HEIGHT</span><strong>{profile.height || "—"} <small>cm</small></strong></div><div><span>BMI</span><strong>{bmi}</strong></div><div><span>BLOOD GROUP</span><strong>{profile.bloodGroup || "—"}</strong></div></div><div className="profile-details"><span>Medical conditions <b>{profile.conditions || "Not added"}</b></span><span>Medications <b>{profile.medications || "Not added"}</b></span><span>Allergies <b>{profile.allergies || "Not added"}</b></span></div></section>
{editingProfile && <div className="profile-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setEditingProfile(false); }}><form className="profile-modal" onSubmit={saveProfile}><div className="profile-modal-heading"><div><span className="profile-label">YOUR DETAILS</span><h2>Personal health profile</h2></div><button type="button" className="modal-close" onClick={() => setEditingProfile(false)} aria-label="Close">×</button></div><div className="profile-form-grid"><label>Full name<input value={profileDraft.name} onChange={e => setProfileDraft({...profileDraft,name:e.target.value})} placeholder="Enter full name"/></label><label>Age<input type="number" min="1" max="120" value={profileDraft.age} onChange={e => setProfileDraft({...profileDraft,age:e.target.value})} placeholder="Years"/></label><label>Weight (kg)<input type="number" min="1" step="0.1" value={profileDraft.weight} onChange={e => setProfileDraft({...profileDraft,weight:e.target.value})} placeholder="e.g. 65"/></label><label>Height (cm)<input type="number" min="1" step="0.1" value={profileDraft.height} onChange={e => setProfileDraft({...profileDraft,height:e.target.value})} placeholder="e.g. 165"/></label><label>Blood group<select value={profileDraft.bloodGroup} onChange={e => setProfileDraft({...profileDraft,bloodGroup:e.target.value})}><option value="">Select blood group</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(group => <option key={group}>{group}</option>)}</select></label><label>Medical conditions<input value={profileDraft.conditions} onChange={e => setProfileDraft({...profileDraft,conditions:e.target.value})} placeholder="e.g. Diabetes, hypertension"/></label><label>Medications<input value={profileDraft.medications} onChange={e => setProfileDraft({...profileDraft,medications:e.target.value})} placeholder="Add prescribed medicines"/></label><label>Allergies<input value={profileDraft.allergies} onChange={e => setProfileDraft({...profileDraft,allergies:e.target.value})} placeholder="Mention known allergies"/></label></div><p className="profile-privacy-note">Your details are saved in this browser on this device. BMI is calculated from height and weight.</p><div className="profile-modal-actions"><button type="button" className="modal-cancel" onClick={() => setEditingProfile(false)}>Cancel</button><button type="submit" className="modal-save">Save profile <Icon name="arrow" size={15}/></button></div></form></div>}
<div className="dash-section-heading"><div><span className="section-eyebrow">01 / REPORTS</span><h2>Your health reports</h2><p>Add lab reports and keep your health records together.</p></div><label className="outline-action upload-label"><Icon name="plus" size={15}/> Add report<input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setSelectedReport(e.target.files?.[0]?.name || "")}/></label></div>
<div className="reports-panel"><div className="report-icon"><Icon name="feed" size={23}/></div><div className="report-copy"><h3>New report? Bring it to REVIVE.</h3><p>Upload a PDF or image. Report extraction, explanations and comparisons will be enabled here.</p>{selectedReport && <span className="selected-file">Selected: {selectedReport}</span>}</div><div className="report-plus"><Icon name="plus" size={24}/></div></div>
<div className="dash-section-heading"><div><span className="section-eyebrow">02 / UNDERSTAND</span><h2>Lifestyle & healthy ageing</h2><p>A holistic view of the everyday factors that shape your wellbeing.</p></div></div>
<div className="feature-grid">
<article className="feature-card"><span className="feature-icon"><Icon name="activity"/></span><div><h3>Current lifestyle</h3><p>Activity, sleep, nutrition, hydration and daily habits.</p></div><span className="coming-soon">COMING SOON</span></article>
<article className="feature-card"><span className="feature-icon"><Icon name="heart"/></span><div><h3>Healthy ageing insights</h3><p>Understand modifiable risk factors and areas to focus on.</p></div><span className="coming-soon">COMING SOON</span></article>
<article className="feature-card"><span className="feature-icon"><Icon name="activity"/></span><div><h3>Longevity insights</h3><p>Evidence-based population insights, not a lifespan countdown.</p></div><span className="coming-soon">COMING SOON</span></article>
</div>
<div className="dash-section-heading"><div><span className="section-eyebrow">03 / NUTRITION</span><h2>Nutrition & your diet</h2><p>Understand your nutrition and shape meals around your needs.</p></div></div>
<div className="nutrition-grid">
<article className="nutrition-card"><div className="nutrition-card-top"><span className="feature-icon"><Icon name="heart"/></span><span className="coming-soon">COMING SOON</span></div><h3>Your recommended diet</h3><p>Personalized meal guidance based on your profile, preferences and clinician-reviewed health needs.</p><ul><li>Daily nutrition targets</li><li>Meal ideas and portion guidance</li><li>Dietary preferences and restrictions</li></ul></article>
<article className="nutrition-card"><div className="nutrition-card-top"><span className="feature-icon"><Icon name="feed"/></span><span className="coming-soon">COMING SOON</span></div><h3>Make your own diet</h3><p>Build a meal plan using the foods, ingredients and budget you already have.</p><ul><li>Add available food resources</li><li>Track protein, carbs, fats and fibre</li><li>Find food-based ways to fill nutrition gaps</li></ul></article>
</div>
<div className="dash-section-heading"><div><span className="section-eyebrow">04 / TAKE ACTION</span><h2>Your personal action plan</h2><p>Small, practical steps that support healthier everyday routines.</p></div></div>
<div className="action-plan-panel"><div className="action-plan-intro"><span className="feature-icon"><Icon name="clock"/></span><div><h3>Your weekly health goals</h3><p>Activity, sleep, nutrition and preventive-care goals will be organized here.</p></div><span className="coming-soon">COMING SOON</span></div><div className="goal-preview"><span>Movement & mobility</span><span>Balanced nutrition</span><span>Sleep & hydration</span><span>Preventive checkups</span></div></div>
<div className="dash-section-heading"><div><span className="section-eyebrow">05 / TRACK</span><h2>Health trends & progress</h2><p>Follow changes in your health indicators over time.</p></div></div>
<div className="trends-panel"><div className="trend-intro"><span className="feature-icon"><Icon name="activity"/></span><div><h3>Your health timeline</h3><p>Compare measurements and reports over time to understand what is changing.</p></div><span className="coming-soon">COMING SOON</span></div><div className="trend-metrics"><span>WEIGHT <b>—</b></span><span>BLOOD PRESSURE <b>—</b></span><span>BLOOD SUGAR <b>—</b></span><span>CHOLESTEROL <b>—</b></span></div><div className="trend-empty">Your progress charts will appear when data is available.</div></div>
<div className="dash-section-heading"><div><span className="section-eyebrow">06 / EVERYDAY SUPPORT</span><h2>More ways REVIVE can help</h2><p>Additional tools designed around the needs of healthy ageing.</p></div></div>
<div className="feature-grid support-grid">
<article className="feature-card"><span className="feature-icon"><Icon name="clock"/></span><div><h3>Medication reminders</h3><p>Keep track of prescribed medicine schedules.</p></div><span className="coming-soon">COMING SOON</span></article>
<article className="feature-card"><span className="feature-icon"><Icon name="activity"/></span><div><h3>Preventive checkups</h3><p>Keep screening and follow-up reminders in one place.</p></div><span className="coming-soon">COMING SOON</span></article>
<article className="feature-card"><span className="feature-icon"><Icon name="users"/></span><div><h3>Cognitive wellness</h3><p>Explore memory activities and cognitive wellbeing.</p></div><span className="coming-soon">COMING SOON</span></article>
<article className="feature-card"><span className="feature-icon"><Icon name="activity"/></span><div><h3>Mobility & fall prevention</h3><p>Support balance, strength and safe movement.</p></div><span className="coming-soon">COMING SOON</span></article>
<article className="feature-card"><span className="feature-icon"><Icon name="heart"/></span><div><h3>AI health assistant</h3><p>Ask questions about reports, nutrition and healthy habits.</p></div><span className="coming-soon">COMING SOON</span></article>
<article className="feature-card"><span className="feature-icon"><Icon name="users"/></span><div><h3>Family & caregiver access</h3><p>Share selected health updates with trusted people.</p></div><span className="coming-soon">COMING SOON</span></article>
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
        {activeTab === "feed" && <footer className="footer"><span>© 2026 REVIVE</span><span>AI-POWERED PREVENTIVE HEALTHCARE FOR SENIORS</span><span>LIVE, YOU DESERVE IT.</span></footer>}
      </main>
      <nav className="bottom-nav" aria-label="Main navigation">
        <button className={activeTab === "dashboard" ? "bottom-nav-item active" : "bottom-nav-item"} onClick={() => setActiveTab("dashboard")}><Icon name="grid" size={21}/><span>Dashboard</span></button>
        <button className={activeTab === "feed" ? "bottom-nav-item active" : "bottom-nav-item"} onClick={() => setActiveTab("feed")}><Icon name="feed" size={21}/><span>Feed</span></button>
      </nav>
    </div>
  );
}

export default App;
