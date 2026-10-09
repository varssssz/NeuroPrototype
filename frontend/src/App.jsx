
import { useEffect, useState } from "react";
import {
  Activity,
  Brain,
  ChevronDown,
  CircleHelp,
  Database,
  FileChartColumn,
  Gauge,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import "./App.css";

const API = "http://127.0.0.1:8000";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Regional Analysis", icon: Brain },
  { label: "Cognitive Analysis", icon: Activity },
  { label: "ML Predictions", icon: Gauge },
  { label: "Subject Explorer", icon: Users },
];

const regionNames = [
  ["Hippocampus", "Hippocampus_ZScore"],
  ["Frontal Lobe", "Frontal_Lobe_ZScore"],
  ["Temporal Lobe", "Temporal_Lobe_ZScore"],
  ["Parietal Lobe", "Parietal_Lobe_ZScore"],
];

function formatNumber(value, digits = 2) {
  return Number.isFinite(Number(value))
    ? Number(value).toFixed(digits)
    : "—";
}

function StatCard({ label, value, detail, icon: Icon, accent }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${accent}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </article>
  );
}

function BrainIllustration({ view }) {
  const isSide = view === 1;

  return (
    <div className={`brain-art ${isSide ? "side-view" : "top-view"}`}>
      {isSide ? (
        <svg viewBox="0 0 340 250" role="img" aria-label="Illustrative side view of the brain">
          <defs>
            <linearGradient id="brainSide" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="55%" stopColor="#6579e8" />
              <stop offset="100%" stopColor="#35c9d8" />
            </linearGradient>
            <filter id="brainGlow">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <ellipse cx="170" cy="125" rx="118" ry="78" fill="#7065ef" opacity=".16" filter="url(#brainGlow)" />
          <path
            d="M52 135 C36 112 51 83 75 77 C78 51 111 39 134 52 C157 29 192 39 205 53 C236 43 269 64 268 88 C295 102 295 129 277 147 C265 168 238 174 218 164 C201 185 172 183 157 167 C129 182 101 168 96 153 C75 160 57 151 52 135Z"
            fill="url(#brainSide)"
            stroke="#a5b4fc"
            strokeWidth="2"
          />
          <path d="M75 91 Q108 66 132 92 T183 76 T243 89 M63 118 Q96 98 117 121 T167 105 T221 117 T275 103 M81 145 Q112 124 134 146 T181 132 T223 148 T258 137 M112 61 Q104 89 119 102 M151 48 Q137 72 151 91 M196 53 Q181 77 197 98 M235 71 Q218 94 238 107 M142 124 Q128 146 146 162 M201 115 Q189 138 207 158" fill="none" stroke="#d9e5ff" strokeWidth="2" opacity=".75" strokeLinecap="round" />
          <path d="M170 168 Q182 191 202 185 Q216 179 211 160" fill="none" stroke="#35c9d8" strokeWidth="7" strokeLinecap="round" />
          <path d="M210 185 Q230 196 242 182" fill="none" stroke="#35c9d8" strokeWidth="5" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 340 250" role="img" aria-label="Illustrative top view of the brain">
          <defs>
            <linearGradient id="brainTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#35c9d8" />
              <stop offset="50%" stopColor="#6475ee" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <filter id="topGlow">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <ellipse cx="170" cy="125" rx="100" ry="108" fill="#6475ee" opacity=".17" filter="url(#topGlow)" />
          <path d="M160 32 C139 17 112 31 105 48 C78 40 58 63 63 86 C43 101 51 126 65 139 C53 161 71 186 92 188 C101 211 128 217 148 198 L164 175Z" fill="url(#brainTop)" stroke="#a5b4fc" strokeWidth="2" />
          <path d="M180 32 C201 17 228 31 235 48 C262 40 282 63 277 86 C297 101 289 126 275 139 C287 161 269 186 248 188 C239 211 212 217 192 198 L176 175Z" fill="url(#brainTop)" stroke="#a5b4fc" strokeWidth="2" />
          <path d="M170 29 L170 198 M91 67 Q121 52 140 78 T158 106 M65 103 Q97 84 120 111 T157 135 M76 150 Q107 128 129 157 T157 177 M249 67 Q219 52 200 78 T182 106 M275 103 Q243 84 220 111 T183 135 M264 150 Q233 128 211 157 T183 177 M108 43 Q95 71 117 90 M135 38 Q124 62 140 75 M232 43 Q245 71 223 90 M205 38 Q216 62 200 75" fill="none" stroke="#d9e5ff" strokeWidth="2" opacity=".8" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

function BrainViewer({ subjects }) {
  const [view, setView] = useState(0);
  const subject = subjects[0];

  return (
    <section className="panel brain-panel">
      <div className="panel-heading">
        <div>
          <h2>Regional Brain Analysis</h2>
          <p>Explore anatomical regions</p>
        </div>
        <span className="live-tag"><span /> ANALYTICS</span>
      </div>

      <div className="brain-viewer">
        <BrainIllustration view={view} />
        <div className="brain-caption">
          <span>{view === 0 ? "AXIAL · TOP VIEW" : "SAGITTAL · SIDE VIEW"}</span>
          <span className="illustrative-label">Illustrative anatomy</span>
        </div>
        <div className="pagination-dots" aria-label="Brain viewpoint">
          <button
            className={view === 0 ? "dot active" : "dot"}
            onClick={() => setView(0)}
            aria-label="Show top view"
            aria-pressed={view === 0}
          />
          <button
            className={view === 1 ? "dot active" : "dot"}
            onClick={() => setView(1)}
            aria-label="Show side view"
            aria-pressed={view === 1}
          />
        </div>
      </div>

      <div className="region-list">
        {regionNames.map(([label, key], index) => {
          const score = subject ? Number(subject[key]) : NaN;
          const color = ["cyan", "purple", "blue", "green"][index];
          return (
            <div className="region-row" key={key}>
              <span className={`region-dot ${color}`} />
              <span className="region-name">{label}</span>
              <span className={`z-score ${Number.isFinite(score) && Math.abs(score) > 2 ? "warning" : ""}`}>
                {Number.isFinite(score) ? `${score > 0 ? "+" : ""}${score.toFixed(2)}` : "—"}
              </span>
            </div>
          );
        })}
      </div>
      <p className="panel-footnote">Z-scores are relative to the fitted reference model.</p>
    </section>
  );
}

function App() {
  const [summary, setSummary] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [activePage, setActivePage] = useState("Overview");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const endpoints = [
          `${API}/api/summary`,
          `${API}/api/subjects`,
          `${API}/api/correlations`,
          `${API}/api/predictions`,
        ];

        const responses = await Promise.all(endpoints.map((url) => fetch(url)));
        const failed = responses.find((response) => !response.ok);
        if (failed) throw new Error(`API request failed (${failed.status})`);

        const [summaryData, subjectData, correlationData, predictionData] =
          await Promise.all(responses.map((response) => response.json()));

        if (cancelled) return;

        setSummary(summaryData);
        setSubjects(subjectData);
        setCorrelations(correlationData);
        setPredictions(predictionData);
        setError("");
      } catch (exception) {
        if (!cancelled) setError(exception.message || "Unable to connect to the API");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSubjects = subjects.filter((subject) =>
    String(subject.Subject_ID).toLowerCase().includes(searchText.toLowerCase())
  );

  const regionChart = regionNames.map(([label, key]) => ({
    region: label,
    zScore: subjects.length
      ? Number(
          subjects.reduce((sum, subject) => sum + Math.abs(Number(subject[key]) || 0), 0) /
            subjects.length
        ).toFixed(2)
      : 0,
  }));

  const modelChart = predictions.map((item) => ({
    name: `${item.Cognitive_Score.replace("_Score", "")} · ${item.Model === "Linear Regression" ? "LR" : "RF"}`,
    r2: Number(item.R2),
  }));

  const correlationChart = [...correlations]
    .filter((item) => item.Feature_Type === "Volume")
    .sort((a, b) => Math.abs(Number(b.Pearson_Correlation)) - Math.abs(Number(a.Pearson_Correlation)))
    .slice(0, 6)
    .map((item) => ({
      name: `${item.Brain_Region.replace("_Lobe", "").replace("_", " ")} · ${item.Cognitive_Score.replace("_Score", "")}`,
      correlation: Number(item.Pearson_Correlation),
    }));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Brain size={23} /></div>
          <div className="brand-copy">
            <strong>Neuro<span>Vision</span></strong>
            <small>BRAIN ANALYTICS</small>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "selected" : ""}`}
              onClick={() => setActivePage(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Overview" && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="workspace-label">PREFERENCES</div>
          <button className="nav-item"><Settings size={18} /><span>Settings</span></button>
          <button className="nav-item"><CircleHelp size={18} /><span>Help & support</span></button>
          <div className="sidebar-status">
            <span className="status-orb" />
            <div><strong>Analytics engine</strong><small>{error ? "Connection issue" : "API integration"}</small></div>
            <span className="status-light" />
          </div>
          <div className="profile">
            <div className="profile-avatar">NV</div>
            <div className="profile-copy"><strong>Research Workspace</strong><small>Local environment</small></div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <span className="api-status"><span className={error ? "status-red" : ""} />{error ? "API offline" : "API connection"}</span>
            <button className="icon-button" aria-label="Search"><Search size={18} /></button>
            <button className="user-button"><span>R</span><ChevronDown size={15} /></button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-title-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> BRAIN MRI INTELLIGENCE</div>
              <h1>{activePage === "Overview" ? "Analytics Overview" : activePage}</h1>
              <p className="page-subtitle">Explore regional brain measurements and cognitive associations.</p>
            </div>
            <div className="date-chip"><Activity size={15} /><span>Research analytics</span><ChevronDown size={14} /></div>
          </div>

          <div className="data-notice">
            <ShieldCheck size={17} />
            <span><strong>Research dataset</strong> — all currently displayed results use synthetic data, not real patient findings.</span>
          </div>

          {error && (
            <div className="error-banner">
              <Database size={18} />
              <div><strong>Unable to load analytics</strong><p>{error}. Make sure the FastAPI server is running at {API}.</p></div>
            </div>
          )}

          {loading && <div className="loading-line"><span /> Loading analytics from the backend…</div>}

          <section className="stats-grid">
            <StatCard label="Subjects Analyzed" value={summary?.subjects_analyzed ?? "—"} detail="Evaluated subjects" icon={Users} accent="accent-blue" />
            <StatCard label="Brain Regions" value={summary?.regions_analyzed ?? "—"} detail="Regional measurements" icon={Brain} accent="accent-purple" />
            <StatCard label="Mean |Z-score|" value={formatNumber(summary?.average_absolute_z_score, 3)} detail="Across evaluated regions" icon={Activity} accent="accent-cyan" />
            <StatCard label="Cognitive Targets" value="03" detail="Memory · Executive · MMSE" icon={Zap} accent="accent-orange" />
          </section>

          <section className="dashboard-grid">
            <BrainViewer subjects={subjects} />

            <section className="panel chart-panel">
              <div className="panel-heading">
                <div><h2>Regional Deviation</h2><p>Mean absolute Z-score by region</p></div>
                <span className="chart-tag">Z-SCORE</span>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionChart} margin={{ top: 12, right: 6, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#253247" strokeDasharray="3 5" vertical={false} />
                    <XAxis dataKey="region" tick={{ fill: "#8795ad", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#8795ad", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#101b2b", border: "1px solid #2b3b54", borderRadius: 10 }} />
                    <Bar dataKey="zScore" name="Mean |Z-score|" fill="#7585ff" radius={[5, 5, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend"><span className="legend-square" /> Mean absolute regional Z-score</div>
            </section>
          </section>

          <section className="lower-grid">
            <section className="panel">
              <div className="panel-heading">
                <div><h2>Cognitive Associations</h2><p>Strongest volume correlations</p></div>
                <span className="mini-tag">PEARSON r</span>
              </div>
              <div className="chart-wrap lower-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={correlationChart} margin={{ top: 10, right: 10, left: -18, bottom: 2 }}>
                    <defs><linearGradient id="correlationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#37c6d4" stopOpacity=".32" /><stop offset="100%" stopColor="#37c6d4" stopOpacity="0" /></linearGradient></defs>
                    <CartesianGrid stroke="#253247" strokeDasharray="3 5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#8795ad", fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis domain={[0, 1]} tick={{ fill: "#8795ad", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#101b2b", border: "1px solid #2b3b54", borderRadius: 10 }} />
                    <Area type="monotone" dataKey="correlation" name="Pearson correlation" stroke="#37c6d4" fill="url(#correlationFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="panel-footnote">Associations shown are unadjusted and derived from synthetic data.</p>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div><h2>Prediction Performance</h2><p>R² across cognitive targets</p></div>
                <span className="mini-tag">MODEL METRICS</span>
              </div>
              <div className="chart-wrap lower-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelChart} margin={{ top: 10, right: 10, left: -18, bottom: 2 }}>
                    <CartesianGrid stroke="#253247" strokeDasharray="3 5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#8795ad", fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis domain={[0, 1]} tick={{ fill: "#8795ad", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#101b2b", border: "1px solid #2b3b54", borderRadius: 10 }} />
                    <Bar dataKey="r2" name="R²" fill="#a78bfa" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="panel-footnote">Higher R² indicates better fit on the reported test split.</p>
            </section>
          </section>

          <section className="panel subjects-panel">
            <div className="panel-heading subjects-heading">
              <div><h2>Subject Explorer</h2><p>Browse evaluated subjects and regional Z-scores</p></div>
              <label className="subject-search"><Search size={15} /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search subject ID…" /></label>
            </div>
            <div className="table-scroll">
              <table>
                <thead><tr><th>SUBJECT ID</th><th>HIPPOCAMPUS</th><th>FRONTAL</th><th>TEMPORAL</th><th>PARIETAL</th><th>STATUS</th></tr></thead>
                <tbody>
                  {filteredSubjects.slice(0, 6).map((subject) => {
                    const scores = regionNames.map(([, key]) => Number(subject[key]));
                    const abnormal = scores.some((score) => Math.abs(score) > 2);
                    return (
                      <tr key={subject.Subject_ID}>
                        <td className="subject-id">{subject.Subject_ID}</td>
                        {scores.map((score, index) => <td key={regionNames[index][1]} className={Math.abs(score) > 2 ? "table-warning" : ""}>{score > 0 ? "+" : ""}{formatNumber(score)}</td>)}
                        <td><span className={`subject-status ${abnormal ? "attention" : "within"}`}><span />{abnormal ? "Review threshold" : "Within threshold"}</span></td>
                      </tr>
                    );
                  })}
                  {!loading && filteredSubjects.length === 0 && <tr><td colSpan="6" className="empty-state">No subjects match your search.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing {Math.min(filteredSubjects.length, 6)} of {filteredSubjects.length} matching subjects</span><span>Threshold: |Z| &gt; 2</span></div>
          </section>

          <footer className="page-footer">
            <span>NEUROVISION <span className="footer-separator">/</span> BRAIN MRI ANALYTICS</span>
            <span><span className="footer-dot" /> Local API · {error ? "Disconnected" : "Connection monitored"}</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;