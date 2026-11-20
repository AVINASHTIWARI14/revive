import { useEffect, useRef, useState } from "react";

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
  const [authMode, setAuthMode] = useState("");
  const [feed, setFeed] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [apiStatus, setApiStatus] = useState("checking");
  const [selectedReport, setSelectedReport] = useState("");
  const emptyProfile = { name: user?.name || "", age: "", gender: "", weight: "", height: "", bloodGroup: "", conditions: "", medications: "", allergies: "" };
  const [profile, setProfile] = useState(() => {
    try { return { ...emptyProfile, ...JSON.parse(localStorage.getItem("revive-health-profile") || "{}") }; }
    catch { return emptyProfile; }
  });
  const [profileDraft, setProfileDraft] = useState(profile);
  const [editingProfile, setEditingProfile] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && cameraStream) videoRef.current.srcObject = cameraStream;
    return () => cameraStream?.getTracks().forEach(track => track.stop());
  }, [cameraStream]);
  const startCamera = async () => {
    setPhotoError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setPhotoError("Camera access needs HTTPS or localhost. Open REVIVE on localhost or a secure connection.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      setCameraStream(stream);
    } catch (error) {
      setPhotoError(error.name === "NotAllowedError" ? "Camera permission was blocked. Allow camera access in your browser settings and try again." : error.name === "NotFoundError" ? "No camera was found on this device." : "Could not open the camera. Check that it is connected and not being used by another app.");
    }
  };
  const captureCameraPhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) { setPhotoError("Camera is still starting. Try again in a moment."); return; }
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1200 / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.82);
    try {
      const next = { ...profile, photoDataUrl };
      localStorage.setItem("revive-health-profile", JSON.stringify(next));
      setProfile(next);
      setCameraStream(null);
      setAvatarMenuOpen(false);
      setPhotoError("");
    } catch { setPhotoError("Could not save this photo. Try again with a smaller image."); }
  };
  const closeCamera = () => setCameraStream(null);
  const saveProfilePhoto = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setPhotoError("Please choose an image file."); setAvatarMenuOpen(true); return; }
    if (file.size > 2.5 * 1024 * 1024) { setPhotoError("Choose an image smaller than 2.5 MB."); setAvatarMenuOpen(true); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = { ...profile, photoDataUrl: reader.result };
        setProfile(next);
        localStorage.setItem("revive-health-profile", JSON.stringify(next));
        setPhotoError("");
        setAvatarMenuOpen(false);
      } catch { setPhotoError("Could not save this image. Try a smaller photo."); setAvatarMenuOpen(true); }
    };
    reader.readAsDataURL(file);
  };
  const removeProfilePhoto = () => {
    const next = { ...profile, photoDataUrl: "" };
    setProfile(next);
    localStorage.setItem("revive-health-profile", JSON.stringify(next));
    setAvatarMenuOpen(false);
    setPhotoError("");
  };
  const bmiValue = Number(profile.weight) / ((Number(profile.height) / 100) ** 2);
  const hasValidBmi = Number(profile.weight) > 0 && Number(profile.height) > 0 && Number.isFinite(bmiValue);
  const bmi = hasValidBmi ? bmiValue.toFixed(1) : "—";
  const bmiCategory = !hasValidBmi ? "Add height & weight" : bmiValue < 18.5 ? "Underweight" : bmiValue < 25 ? "Healthy" : bmiValue < 30 ? "Overweight" : "Obesity";
  const bmiClass = !hasValidBmi ? "missing" : bmiValue < 18.5 ? "underweight" : bmiValue < 25 ? "healthy" : bmiValue < 30 ? "overweight" : "obesity";
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

  if (!user) {
    return (
      <div className="app-shell landing-shell">
        <main className="main-area landing-main">
          <header className="topbar landing-topbar">
            <div className="breadcrumb" aria-hidden="true"></div>
            <div className="topbar-right"><div className="top-brand">REVIVE</div></div>
          </header>
          <section className="landing-hero">
            <div className="landing-orb landing-orb-one"></div><div className="landing-orb landing-orb-two"></div>
            <div className="landing-content">
              <span className="landing-kicker"><i></i> PREVENTIVE HEALTH. MORE MEANINGFUL YEARS.</span>
              <h1>Live well.<br/><em>Age well.</em></h1>
              <p className="landing-description">Your health journey deserves more than numbers. Discover a clearer, more thoughtful way to understand your wellbeing and build healthier habits.</p>
              <div className="landing-actions">
                <button className="landing-primary" type="button" onClick={() => setAuthMode("signup")}>Get started <Icon name="arrow" size={17}/></button>
                <button className="landing-secondary" type="button" onClick={() => setAuthMode("login")}>Log in</button>
              </div>
              <div className="landing-note"><span>✳</span> A little care today can shape a better tomorrow.</div>
            </div>
            <div className="landing-art" aria-hidden="true"><div className="landing-art-ring ring-a"></div><div className="landing-art-ring ring-b"></div><div className="landing-leaf">✳</div><div className="landing-art-caption">WELLNESS<br/>IN EVERY DAY</div></div>
            <div className="landing-bottomline"><span>01 — YOUR HEALTH, YOUR PACE</span><span>MADE FOR HEALTHIER AGEING</span></div>
          </section>
          {authMode && <div className="landing-auth-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAuthMode(""); }}>
            <section className="landing-auth-card" role="dialog" aria-modal="true" aria-labelledby="landing-auth-title">
              <button className="landing-auth-close" type="button" onClick={() => setAuthMode("")} aria-label="Close">×</button>
              <span className="landing-kicker">WELCOME TO REVIVE</span>
              <h2 id="landing-auth-title">{authMode === "signup" ? "Create your account" : "Welcome back"}</h2>
              <p>Secure sign-in and account creation will be enabled when authentication is connected.</p>
              <button className="landing-auth-back" type="button" onClick={() => setAuthMode("")}>Back to home</button>
            </section>
          </div>}
        </main>
      </div>
    );
  }

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
<section className="profile-overview"><div className="profile-avatar-wrap"><button className="profile-avatar" type="button" onClick={() => { setAvatarMenuOpen(open => !open); setPhotoError(""); }} aria-label="Change profile photo" aria-expanded={avatarMenuOpen}>{profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="Your profile"/> : <Icon name="users" size={25}/>}<span className="avatar-camera"><Icon name="plus" size={15}/></span></button>{avatarMenuOpen && <div className="avatar-menu"><strong>Profile photo</strong>{cameraStream ? <div className="camera-panel"><video ref={videoRef} autoPlay playsInline muted/><div className="camera-actions"><button type="button" onClick={captureCameraPhoto}>Capture photo</button><button type="button" onClick={closeCamera}>Cancel</button></div></div> : <><button type="button" onClick={startCamera}><Icon name="activity" size={15}/> Take a photo</button><label><Icon name="feed" size={15}/> Choose from device<input type="file" accept="image/*" onChange={saveProfilePhoto}/></label>{profile.photoDataUrl && <button type="button" onClick={removeProfilePhoto}>Remove photo</button>}</>}{photoError && <small>{photoError}</small>}</div>}</div><div className="profile-main"><h2>{profile.name || "Your profile"}{profile.gender && <span className="profile-gender"> ({profile.gender})</span>}</h2><p>{profile.age ? `Age ${profile.age}` : "Age not added"}</p></div><button className="outline-action profile-edit" type="button" onClick={() => { setProfileDraft(profile); setEditingProfile(true); }}>{profile.name || profile.age ? "Edit profile" : "Complete profile"} <Icon name="arrow" size={15}/></button><div className="profile-stats"><div><span>WEIGHT</span><strong>{profile.weight || "—"} <small>kg</small></strong></div><div><span>HEIGHT</span><strong>{profile.height || "—"} <small>cm</small></strong></div><div className="bmi-stat"><span>BMI</span><strong>{bmi}</strong><small className={`bmi-status ${bmiClass}`}>{bmiCategory}</small></div><div><span>BLOOD GROUP</span><strong>{profile.bloodGroup || "—"}</strong></div></div><div className="profile-details"><span>Medical conditions <b>{profile.conditions || "Not added"}</b></span><span>Medications <b>{profile.medications || "Not added"}</b></span><span>Allergies <b>{profile.allergies || "Not added"}</b></span></div></section>
{editingProfile && <div className="profile-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setEditingProfile(false); }}><form className="profile-modal" onSubmit={saveProfile}><div className="profile-modal-heading"><div><span className="profile-label">YOUR DETAILS</span><h2>Personal health profile</h2></div><button type="button" className="modal-close" onClick={() => setEditingProfile(false)} aria-label="Close">×</button></div><div className="profile-form-grid"><label>Full name<input value={profileDraft.name} onChange={e => setProfileDraft({...profileDraft,name:e.target.value})} placeholder="Enter full name"/></label><label>Age<input type="number" min="1" max="120" value={profileDraft.age} onChange={e => setProfileDraft({...profileDraft,age:e.target.value})} placeholder="Years"/></label><label>Gender<select value={profileDraft.gender || ""} onChange={e => setProfileDraft({...profileDraft,gender:e.target.value})}><option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option><option value="Prefer not to say">Prefer not to say</option></select></label><label>Weight (kg)<input type="number" min="1" step="0.1" value={profileDraft.weight} onChange={e => setProfileDraft({...profileDraft,weight:e.target.value})} placeholder="e.g. 65"/></label><label>Height (cm)<input type="number" min="1" step="0.1" value={profileDraft.height} onChange={e => setProfileDraft({...profileDraft,height:e.target.value})} placeholder="e.g. 165"/></label><label>Blood group<select value={profileDraft.bloodGroup} onChange={e => setProfileDraft({...profileDraft,bloodGroup:e.target.value})}><option value="">Select blood group</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(group => <option key={group}>{group}</option>)}</select></label><label>Medical conditions<input value={profileDraft.conditions} onChange={e => setProfileDraft({...profileDraft,conditions:e.target.value})} placeholder="e.g. Diabetes, hypertension"/></label><label>Medications<input value={profileDraft.medications} onChange={e => setProfileDraft({...profileDraft,medications:e.target.value})} placeholder="Add prescribed medicines"/></label><label>Allergies<input value={profileDraft.allergies} onChange={e => setProfileDraft({...profileDraft,allergies:e.target.value})} placeholder="Mention known allergies"/></label></div><p className="profile-privacy-note">Your details are saved in this browser on this device. BMI is calculated from height and weight.</p><div className="profile-modal-actions"><button type="button" className="modal-cancel" onClick={() => setEditingProfile(false)}>Cancel</button><button type="submit" className="modal-save">Save profile <Icon name="arrow" size={15}/></button></div></form></div>}
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
