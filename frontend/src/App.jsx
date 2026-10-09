import { useEffect, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ErrorBar, Legend, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Activity, ArrowRight, Bell, Brain, ChevronDown, Cpu, LayoutDashboard,
  Search, Settings, ShieldCheck, Target, TrendingUp, User, Users,
} from "lucide-react";
import "./App.css";

const API = import.meta.env.PROD ? "/api" : "http://127.0.0.1:8000/api";
const REGIONS = [
  { key: "Hippocampus", label: "Hippocampus", color: "#3b82f6" },
  { key: "Frontal_Lobe", label: "Frontal Lobe", color: "#34d399" },
  { key: "Temporal_Lobe", label: "Temporal Lobe", color: "#fbbf24" },
  { key: "Parietal_Lobe", label: "Parietal Lobe", color: "#f0abfc" },
];
const SCORES = [
  { key: "Memory_Score", label: "Memory" },
  { key: "Executive_Score", label: "Executive" },
  { key: "MMSE", label: "MMSE" },
];
const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "brain", label: "Brain Analysis", icon: Brain },
  { key: "cognitive", label: "Cognitive Analysis", icon: Activity },
  { key: "ml", label: "ML Predictions", icon: Cpu },
  { key: "explorer", label: "Subject Explorer", icon: User },
  { key: "settings", label: "Settings", icon: Settings },
];
const TITLES = {
  overview: ["Brain MRI Analytics Dashboard", "Regional analysis, cognitive relationships and predictive modelling"],
  brain: ["Brain Analysis", "Regional volumes, expected volumes and Z-score distributions"],
  cognitive: ["Cognitive Analysis", "Associations between regional measures and cognitive scores"],
  ml: ["ML Predictions", "Cognitive-score prediction models evaluated on synthetic data"],
  explorer: ["Subject Explorer", "Browse individual subjects and their regional Z-scores"],
  settings: ["Settings", "Display options and connection details"],
};
const TIP = { contentStyle: { background: "#0f1428", border: "1px solid #2a3158", borderRadius: 8 }, labelStyle: { color: "#e8eaf6" } };
const TICK = { fill: "#8b93b5", fontSize: 12 };

const mean = (a) => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((v) => (v - m) ** 2))); };
const f2 = (v) => (v == null ? "–" : Number(v).toFixed(2));
const fp = (p) => (p < 0.001 ? "< 0.001" : Number(p).toFixed(3));
const label = (list, key) => list.find((x) => x.key === key)?.label ?? key;

function linfit(pts) {
  const mx = mean(pts.map((p) => p.x)), my = mean(pts.map((p) => p.y));
  let sxy = 0, sxx = 0;
  pts.forEach((p) => { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; });
  const b = sxy / sxx;
  return { b, a: my - b * mx };
}

/* ---------- small components ---------- */
function Panel({ title, sub, right, className = "", children }) {
  return (
    <section className={`panel ${className}`}>
      {(title || right) && (
        <div className="panel-head">
          <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

function Toggle({ options, value, onChange }) {
  return (
    <div className="toggle">
      {options.map(([k, l]) => (
        <button key={k} className={value === k ? "on" : ""} onClick={() => onChange(k)}>{l}</button>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label: l, value, detail, bar, tone = "purple" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={22} /></div>
      <div className="stat-body">
        <span className="stat-label">{l}</span>
        <strong className="stat-value">{value}</strong>
        <span className="stat-detail">{detail}</span>
        {bar != null && <div className="bar-track"><div style={{ width: `${bar}%` }} /></div>}
      </div>
    </div>
  );
}

function BrainSvg() {
  return (
    <svg viewBox="0 0 200 220" className="brain-svg">
      <defs><clipPath id="bc"><ellipse cx="100" cy="110" rx="84" ry="100" /></clipPath></defs>
      <ellipse cx="100" cy="110" rx="86" ry="102" fill="#141a33" stroke="#4b5a99" strokeWidth="2" />
      <g clipPath="url(#bc)" opacity="0.9">
        <ellipse cx="100" cy="42" rx="70" ry="38" fill="#34d399" />
        <ellipse cx="100" cy="182" rx="64" ry="38" fill="#f0abfc" />
        <ellipse cx="26" cy="112" rx="26" ry="48" fill="#fbbf24" />
        <ellipse cx="174" cy="112" rx="26" ry="48" fill="#fbbf24" />
        <ellipse cx="74" cy="112" rx="14" ry="22" fill="#3b82f6" />
        <ellipse cx="126" cy="112" rx="14" ry="22" fill="#3b82f6" />
        <line x1="100" y1="10" x2="100" y2="210" stroke="#0a0e20" strokeWidth="3" />
      </g>
    </svg>
  );
}

function Heatmap({ corr, feature }) {
  const get = (r, s) => corr.find((c) => c.Brain_Region === r && c.Feature_Type === feature && c.Cognitive_Score === s)?.Pearson_Correlation;
  const color = (v) => (v == null ? "#1a2140" : v >= 0 ? `hsl(${210 - 80 * v} 65% ${26 + 10 * v}%)` : `hsl(270 60% ${30 + 10 * v}%)`);
  return (
    <div className="heat-wrap">
      <div className="heat" style={{ gridTemplateColumns: `110px repeat(${SCORES.length}, 1fr)` }}>
        <span />
        {SCORES.map((s) => <b key={s.key}>{s.label}</b>)}
        {REGIONS.map((r) => (
          <div key={r.key} style={{ display: "contents" }}>
            <span className="heat-row">{r.label}</span>
            {SCORES.map((s) => {
              const v = get(r.key, s.key);
              return <div key={s.key} className="heat-cell" style={{ background: color(v) }}>{f2(v)}</div>;
            })}
          </div>
        ))}
      </div>
      <div className="heat-scale"><span>1.0</span><div /><span>-1.0</span></div>
    </div>
  );
}

function ScatterPlot({ points, xLabel, yLabel, identity = false, height = 260 }) {
  const xs = points.map((p) => p.x), lo = Math.min(...xs), hi = Math.max(...xs);
  let line;
  if (identity) {
    const all = points.flatMap((p) => [p.x, p.y]);
    line = [{ x: Math.min(...all), y: Math.min(...all) }, { x: Math.max(...all), y: Math.max(...all) }];
  } else {
    const { a, b } = linfit(points);
    line = [{ x: lo, y: a + b * lo }, { x: hi, y: a + b * hi }];
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 18, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis type="number" dataKey="x" domain={["auto", "auto"]} tick={TICK} tickFormatter={(v) => Math.round(v).toLocaleString()} label={{ value: xLabel, position: "insideBottom", offset: -10, fill: "#8b93b5", fontSize: 12 }} />
          <YAxis type="number" dataKey="y" domain={["auto", "auto"]} tick={TICK} tickFormatter={(v) => Math.round(v)} label={{ value: yLabel, angle: -90, position: "insideLeft", fill: "#8b93b5", fontSize: 12 }} />
          <Tooltip {...TIP} formatter={(v) => f2(v)} />
          <Scatter data={points} fill="#3b82f6" fillOpacity={0.75} />
          <Scatter data={line} line={{ stroke: "#e8eaf6", strokeWidth: 2 }} shape={() => <g />} legendType="none" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function ModelTable({ preds }) {
  return (
    <table className="table">
      <thead><tr><th>Cognitive Score</th><th>Model</th><th>MAE ↓</th><th>RMSE ↓</th><th>R² ↑</th></tr></thead>
      <tbody>
        {SCORES.flatMap((s) => {
          const rows = preds.filter((p) => p.Cognitive_Score === s.key);
          const best = Math.max(...rows.map((r) => r.R2));
          return rows.map((r, i) => (
            <tr key={s.key + r.Model}>
              {i === 0 && <td rowSpan={rows.length} className="strong">{s.label} Score</td>}
              <td>{r.Model}</td><td>{f2(r.MAE)}</td><td>{f2(r.RMSE)}</td>
              <td className={r.R2 === best ? "best" : ""}>{Number(r.R2).toFixed(3)}</td>
            </tr>
          ));
        })}
      </tbody>
    </table>
  );
}

function R2Chart({ preds }) {
  const data = SCORES.map((s) => {
    const o = { name: s.label };
    preds.filter((p) => p.Cognitive_Score === s.key).forEach((p) => { o[p.Model] = +p.R2.toFixed(3); });
    return o;
  });
  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 8, left: -10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={TICK} /><YAxis tick={TICK} domain={[0, 1]} />
          <Tooltip {...TIP} /><Legend />
          <Bar dataKey="Linear Regression" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Random Forest" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SubjectDetail({ s, pred, thr, full }) {
  if (!s) return <p className="muted">No subject found.</p>;
  return (
    <div className="subject">
      <div className="subject-head">
        <strong>{s.Subject_ID}</strong>
        <span className="chip">Age: {s.Age}</span><span className="chip">{s.Sex}</span>
        <span className="chip">ICV: {Math.round(s.ICV).toLocaleString()} cm³</span>
      </div>
      <div className="sub-box">
        <h4>Regional Z-scores</h4>
        {REGIONS.map((r) => {
          const z = s[r.key + "_ZScore"];
          return (
            <div className="sub-row" key={r.key}>
              <i style={{ background: r.color }} /><span>{r.label}</span>
              {full && <small>{Math.round(s[r.key]).toLocaleString()} / {Math.round(s[r.key + "_Expected"]).toLocaleString()} mm³</small>}
              <b className={Math.abs(z) >= thr ? "flag" : z >= 0 ? "pos" : ""}>{f2(z)}</b>
            </div>
          );
        })}
        {full && <p className="muted small">Volume shown as observed / expected. Highlighted when |Z| ≥ {thr}.</p>}
      </div>
      <div className="sub-box">
        <h4>Cognitive Scores{pred ? " (actual / predicted)" : ""}</h4>
        {SCORES.map((c) => (
          <div className="sub-row" key={c.key}>
            <span>{c.label}</span>
            <b>{f2(s[c.key])}{pred ? ` / ${f2(pred[c.key + "_Predicted"])}` : ""}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
const strength = (r2) => (r2 >= 0.4 ? "moderate" : r2 >= 0.2 ? "modest" : r2 >= 0.1 ? "weak" : "negligible");

function Findings({ summary, subjects, corr, preds }) {
  const best = SCORES.map((s) => [...preds.filter((p) => p.Cognitive_Score === s.key)].sort((a, b) => b.R2 - a.R2)[0]);
  const lrWins = best.filter((b) => b.Model === "Linear Regression").length;
  const avgR = (feat) => mean(corr.filter((c) => c.Feature_Type === feat).map((c) => Math.abs(c.Pearson_Correlation)));
  const rv = avgR("Volume"), rz = avgR("ZScore");
  const sc = summary.strongest_correlation;
  const abn = subjects.filter((s) => s.Abnormal_Regions_Count > 0).length;
  const top = [...best].sort((a, b) => b.R2 - a.R2)[0];
  const low = [...best].sort((a, b) => a.R2 - b.R2)[0];

  const items = [
    ["Prediction", `Brain measurements predict ${label(SCORES, top.Cognitive_Score)} best (${strength(top.R2)} fit, R² = ${top.R2.toFixed(2)}) and ${label(SCORES, low.Cognitive_Score)} worst (${strength(low.R2)} fit, R² = ${low.R2.toFixed(2)}).`],
    ["Strongest link", `${label(REGIONS, sc.Brain_Region)} volume vs ${label(SCORES, sc.Cognitive_Score)} has the strongest correlation (r = ${f2(sc.Pearson_Correlation)}): larger volume goes with higher scores.`],
    ["Raw volume vs Z-score", `Raw volumes correlate with cognitive scores (mean |r| = ${f2(rv)}) much more than normalised Z-scores (mean |r| = ${f2(rz)}). In this dataset, much of the link is shared with age, sex and head size, which the normative model removes.`],
    ["Model choice", lrWins === best.length ? "Simple Linear Regression matched or beat Random Forest on every score, so extra model complexity did not help here." : `Linear Regression was best on ${lrWins} of ${best.length} scores; Random Forest led on the rest.`],
    ["Abnormal regions", `${abn} of ${subjects.length} subjects have at least one region flagged as abnormal by the normative model.`],
  ];

  return (
    <Panel title="Research Findings" sub="Plain-language summary of what this dataset shows" className="findings">
      <p className="verdict">
        Regional brain volume has a real but moderate relationship with memory and executive scores, and almost none with MMSE.
      </p>
      <div className="finding-grid">
        {items.map(([h, t]) => (<div className="finding" key={h}><b>{h}</b><p>{t}</p></div>))}
      </div>
      <p className="muted small">
        Based on {subjects.length} synthetic subjects. These are statistical associations, not causes, and not clinical findings or a diagnosis.
      </p>
    </Panel>
  );
}

/* ---------- pages ---------- */
function Dashboard({ data }) {
  const { summary, subjects, corr, preds, predSubjects } = data;
  const [page, setPage] = useState("overview");
  const [mode, setMode] = useState("z");
  const [thr, setThr] = useState(1.5);
  const [selId, setSelId] = useState(subjects[0]?.Subject_ID);
  const [query, setQuery] = useState("");
  const [cardQuery, setCardQuery] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [heatFeat, setHeatFeat] = useState("Volume");
  const [cReg, setCReg] = useState("Temporal_Lobe");
  const [cScore, setCScore] = useState("Executive_Score");
  const [mlScore, setMlScore] = useState("Memory_Score");

  const rs = useMemo(() => REGIONS.map((r) => {
    const z = subjects.map((s) => s[r.key + "_ZScore"]);
    const dev = subjects.map((s) => (s[r.key] / s[r.key + "_Expected"]) * 100 - 100);
    return {
      ...r, z, meanZ: mean(z), seZ: sd(z) / Math.sqrt(z.length), meanDev: mean(dev),
      seDev: sd(dev) / Math.sqrt(dev.length), meanVol: mean(subjects.map((s) => s[r.key])),
      meanExp: mean(subjects.map((s) => s[r.key + "_Expected"])), flagged: z.filter((v) => Math.abs(v) >= thr).length,
    };
  }), [subjects, thr]);

  const sel = subjects.find((s) => s.Subject_ID === selId);
  const selPred = predSubjects.find((p) => p.Subject_ID === selId);
  const bestModel = [...preds].sort((a, b) => b.R2 - a.R2)[0];
  const sc = summary.strongest_correlation;
  const corrRow = (reg, score, feat = "Volume") => corr.find((c) => c.Brain_Region === reg && c.Feature_Type === feat && c.Cognitive_Score === score);

  const volData = rs.map((r) => mode === "z"
    ? { name: r.label, value: +r.meanZ.toFixed(3), err: +r.seZ.toFixed(3) }
    : { name: r.label, value: +r.meanDev.toFixed(3), err: +r.seDev.toFixed(3) });
  const VolChart = (h = 260) => (
    <div style={{ height: h }}>
      <ResponsiveContainer>
        <BarChart data={volData} margin={{ top: 12, right: 8, left: -10 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={TICK} /><YAxis tick={TICK} />
          <Tooltip {...TIP} />
          <Bar dataKey="value" name={mode === "z" ? "Mean Z-score" : "Volume vs expected (%)"} fill={mode === "z" ? "#8b5cf6" : "#3b82f6"} radius={[4, 4, 0, 0]}>
            <ErrorBar dataKey="err" stroke="#e8eaf6" width={5} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  const volToggle = <Toggle value={mode} onChange={setMode} options={[["vol", "Volume"], ["z", "Z-score"]]} />;

  const scatterPts = (reg, score) => subjects.map((s) => ({ x: s[reg], y: s[score] }));
  const ScatterPanel = (reg, score, h = 230) => {
    const c = corrRow(reg, score);
    return (
      <div className="scatter-row">
        <div className="grow"><ScatterPlot points={scatterPts(reg, score)} xLabel={`${label(REGIONS, reg)} volume (mm³)`} yLabel={label(SCORES, score)} height={h} /></div>
        <div className="statbox">
          <span>Pearson r</span><b>{f2(c?.Pearson_Correlation)}</b>
          <span>p-value</span><b>{c ? fp(c.Pearson_P_Value) : "–"}</b>
          <span>R²</span><b>{f2(c?.Regression_R2)}</b>
        </div>
      </div>
    );
  };

  const filtered = subjects.filter((s) => s.Subject_ID.toLowerCase().includes(query.toLowerCase()));
  const PER = 10, pages = Math.max(1, Math.ceil(filtered.length / PER));
  const shown = filtered.slice(pageNo * PER, pageNo * PER + PER);
  const goSubject = (id) => { setSelId(id); setPage("explorer"); };

  const bins = [["< -2", -Infinity, -2], ["-2 to -1", -2, -1], ["-1 to 0", -1, 0], ["0 to 1", 0, 1], ["1 to 2", 1, 2], ["> 2", 2, Infinity]];
  const histData = bins.map(([name, lo, hi]) => {
    const o = { name };
    rs.forEach((r) => { o[r.label] = r.z.filter((v) => v >= lo && v < hi).length; });
    return o;
  });

  const [title, subtitle] = TITLES[page];

  const regionRows = (
    <div className="region-list">
      {rs.map((r) => (
        <div className="region-row" key={r.key}>
          <i style={{ background: r.color }} />
          <div><b>{r.label}</b><small>Mean Z-score</small></div>
          <span>{f2(r.meanZ)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Brain size={40} className="brand-icon" />
          <div><strong>NeuroVision</strong><small>Brain MRI Analytics</small></div>
        </div>
        <nav>
          {NAV.map(({ key, label: l, icon: Icon }) => (
            <button key={key} className={`nav-item ${page === key ? "active" : ""}`} onClick={() => setPage(key)}>
              <Icon size={20} />{l}
            </button>
          ))}
        </nav>
        <div className="synthetic">
          <ShieldCheck size={16} />
          <div><b>Synthetic Data</b><p>All results are based on synthetic data and are not clinical findings.</p></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <label className="search">
            <Search size={16} />
            <input placeholder="Search subjects (e.g., S0362)" value={query}
              onChange={(e) => { setQuery(e.target.value); setPageNo(0); setPage("explorer"); }} />
          </label>
          <div className="top-right">
            <Bell size={18} />
            <div className="avatar">NV</div><span>NeuroVision</span><ChevronDown size={16} />
          </div>
        </header>

        <div className="content">
          <div className="title-row">
            <div><h1>{title}</h1><p className="muted">{subtitle}</p></div>
            <div className="title-chips">
              <div className="info-chip"><small>Dataset</small><b>Synthetic · {summary.subjects_analyzed} subjects</b></div>
              <div className="info-chip ok"><i className="dot" /><div><b>API Connected</b><small>{import.meta.env.PROD ? "Live API" : "127.0.0.1:8000"}</small></div></div>
            </div>
          </div>

          {page === "overview" && (
            <>
              <div className="stats">
                <StatCard icon={Users} label="Subjects Analysed" value={summary.subjects_analyzed} detail={`of ${subjects.length} evaluated subjects`} bar={(summary.subjects_analyzed / subjects.length) * 100} />
                <StatCard icon={Brain} label="Brain Regions" value={summary.regions_analyzed} detail={REGIONS.map((r) => r.label).join(", ")} tone="blue" />
                <StatCard icon={TrendingUp} label="Average |Z| Score" value={f2(summary.average_absolute_z_score)} detail="across all regions" />
                <StatCard icon={Target} label="Best Model (by R²)" value={bestModel.Model} detail={`for ${label(SCORES, bestModel.Cognitive_Score)} Score (R² = ${bestModel.R2.toFixed(3)})`} tone="green" />
              </div>
              <div className="ov-layout">
                <div className="ov-main">
                  <Panel title="Regional Brain Analysis" sub="Average Z-scores across brain regions">
                    <div className="brain-box"><BrainSvg />{regionRows}</div>
                    <p className="muted small">Illustrative diagram, not a real MRI.</p>
                  </Panel>
                  <Panel title="Regional Volume & Z-score Comparison" right={volToggle}>
                    {VolChart(280)}
                    <p className="muted small">{mode === "z" ? "Mean Z-score ± standard error." : "Mean observed volume as % above/below expected, ± standard error."}</p>
                  </Panel>
                  <Panel title="Cognitive Function Correlations" sub="Pearson correlation (region volume vs. cognitive scores)">
                    <Heatmap corr={corr} feature="Volume" />
                  </Panel>
                  <Panel title="Key Relationship" sub={`${label(REGIONS, sc.Brain_Region)} volume vs. ${label(SCORES, sc.Cognitive_Score)} score`.replace("Executive score", "executive score")}>
                    {ScatterPanel(sc.Brain_Region, sc.Cognitive_Score, 220)}
                  </Panel>
                  <Panel title="Cognitive Score Prediction Models" sub="Performance on held-out test set"><ModelTable preds={preds} /></Panel>
                  <Panel title="Model Performance Comparison" sub="R² score across cognitive outcomes"><R2Chart preds={preds} /></Panel>
                </div>
                <div className="ov-side">
                  <Panel title="Subject Explorer" sub="View individual subject details and regional Z-scores">
                    <label className="search small-search"><Search size={14} />
                      <input placeholder="Search by subject ID..." value={cardQuery} onChange={(e) => {
                        setCardQuery(e.target.value);
                        const m = subjects.find((s) => s.Subject_ID.toLowerCase().includes(e.target.value.toLowerCase()));
                        if (m && e.target.value) setSelId(m.Subject_ID);
                      }} />
                    </label>
                    <SubjectDetail s={sel} pred={selPred} thr={thr} />
                    <button className="primary" onClick={() => goSubject(selId)}>View Full Subject Details <ArrowRight size={14} /></button>
                  </Panel>
                  <Panel className="insight">
                    <Brain size={44} className="brand-icon" />
                    <h3>Advanced Brain Analytics</h3>
                    <p className="muted">From MRI-style data to meaningful cognitive insights</p>
                    <div className="insight-foot">Powered by machine learning and statistical analysis</div>
                  </Panel>
                </div>
              </div>
            </>
          )}

          {page === "brain" && (
            <>
              <div className="stats">
                {rs.map((r) => (
                  <StatCard key={r.key} icon={Brain} label={r.label} value={f2(r.meanZ)}
                    detail={`mean Z · ${r.flagged} subjects with |Z| ≥ ${thr}`} tone={r.key === "Frontal_Lobe" ? "green" : r.key === "Hippocampus" ? "blue" : "purple"} />
                ))}
              </div>
              <div className="two-col">
                <Panel title="Regional Volume & Z-score Comparison" right={volToggle}>{VolChart(300)}</Panel>
                <Panel title="Z-score Distribution" sub="Number of subjects per Z-score range">
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={histData} margin={{ top: 12, right: 8, left: -10 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" tick={TICK} /><YAxis tick={TICK} />
                        <Tooltip {...TIP} /><Legend />
                        {REGIONS.map((r) => <Bar key={r.key} dataKey={r.label} fill={r.color} />)}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
              </div>
              <Panel title="Regional Summary" sub="Mean observed vs expected volume across all subjects">
                <table className="table">
                  <thead><tr><th>Region</th><th>Mean volume (mm³)</th><th>Mean expected (mm³)</th><th>vs expected</th><th>Mean Z</th><th>|Z| ≥ {thr}</th></tr></thead>
                  <tbody>
                    {rs.map((r) => (
                      <tr key={r.key}>
                        <td className="strong"><i className="dot-s" style={{ background: r.color }} />{r.label}</td>
                        <td>{Math.round(r.meanVol).toLocaleString()}</td><td>{Math.round(r.meanExp).toLocaleString()}</td>
                        <td>{r.meanDev.toFixed(2)}%</td><td>{f2(r.meanZ)}</td><td>{r.flagged}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="muted small">Expected volume comes from the normative model (age, sex and ICV).</p>
              </Panel>
            </>
          )}

          {page === "cognitive" && (
            <>
              <div className="two-col">
                <Panel title="Correlation Heatmap" sub="Pearson correlation by region and cognitive score"
                  right={<Toggle value={heatFeat} onChange={setHeatFeat} options={[["Volume", "Volume"], ["ZScore", "Z-score"]]} />}>
                  <Heatmap corr={corr} feature={heatFeat} />
                </Panel>
                <Panel title="Explore a Relationship" sub="Region volume vs cognitive score"
                  right={
                    <div className="selects">
                      <select value={cReg} onChange={(e) => setCReg(e.target.value)}>{REGIONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</select>
                      <select value={cScore} onChange={(e) => setCScore(e.target.value)}>{SCORES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
                    </div>}>
                  {ScatterPanel(cReg, cScore, 260)}
                </Panel>
              </div>
              <Panel title="All Correlations" sub="Associations only; correlation does not imply causation">
                <div className="table-scroll">
                  <table className="table">
                    <thead><tr><th>Region</th><th>Feature</th><th>Score</th><th>Pearson r</th><th>p-value</th><th>Spearman ρ</th><th>R²</th></tr></thead>
                    <tbody>
                      {corr.map((c, i) => (
                        <tr key={i}>
                          <td className="strong">{label(REGIONS, c.Brain_Region)}</td><td>{c.Feature_Type === "ZScore" ? "Z-score" : "Volume"}</td>
                          <td>{label(SCORES, c.Cognitive_Score)}</td><td>{f2(c.Pearson_Correlation)}</td><td>{fp(c.Pearson_P_Value)}</td>
                          <td>{f2(c.Spearman_Correlation)}</td><td>{f2(c.Regression_R2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </>
          )}

          {page === "ml" && (
            <>
            <Findings summary={summary} subjects={subjects} corr={corr} preds={preds} />
              <div className="stats">
                {SCORES.map((s) => {
                  const b = [...preds.filter((p) => p.Cognitive_Score === s.key)].sort((a, c) => c.R2 - a.R2)[0];
                  return <StatCard key={s.key} icon={Target} label={`${s.label} · best model`} value={b.Model} detail={`R² = ${b.R2.toFixed(3)} · MAE ${f2(b.MAE)}`} tone="green" />;
                })}
              </div>
              <div className="two-col">
                <Panel title="Cognitive Score Prediction Models" sub="Performance on held-out test set"><ModelTable preds={preds} /></Panel>
                <Panel title="Model Performance Comparison" sub="R² score across cognitive outcomes"><R2Chart preds={preds} /></Panel>
              </div>
              <Panel title="Predicted vs Actual" sub={`${predSubjects.length} subjects. Points on the line are perfect predictions.`}
                right={<select value={mlScore} onChange={(e) => setMlScore(e.target.value)}>{SCORES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select>}>
                <ScatterPlot identity height={320} xLabel={`Actual ${label(SCORES, mlScore)}`} yLabel="Predicted"
                  points={predSubjects.map((p) => ({ x: p[mlScore], y: p[mlScore + "_Predicted"] }))} />
                <p className="muted small">Low R² (especially MMSE) means these synthetic features explain little of that score.</p>
              </Panel>
            </>
          )}

          {page === "explorer" && (
            <div className="explorer">
              <Panel title="Subjects" sub={`${filtered.length} matching subjects`}>
                <div className="table-scroll">
                  <table className="table clickable">
                    <thead><tr><th>ID</th><th>Age</th><th>Sex</th>{REGIONS.map((r) => <th key={r.key}>{r.label} Z</th>)}<th>Abnormal</th></tr></thead>
                    <tbody>
                      {shown.map((s) => (
                        <tr key={s.Subject_ID} className={s.Subject_ID === selId ? "sel" : ""} onClick={() => setSelId(s.Subject_ID)}>
                          <td className="id">{s.Subject_ID}</td><td>{s.Age}</td><td>{s.Sex}</td>
                          {REGIONS.map((r) => <td key={r.key} className={Math.abs(s[r.key + "_ZScore"]) >= thr ? "flag" : ""}>{f2(s[r.key + "_ZScore"])}</td>)}
                          <td>{s.Abnormal_Regions_Count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pager">
                  <span className="muted">Page {pageNo + 1} of {pages}</span>
                  <div>
                    <button disabled={pageNo === 0} onClick={() => setPageNo(pageNo - 1)}>Previous</button>
                    <button disabled={pageNo >= pages - 1} onClick={() => setPageNo(pageNo + 1)}>Next</button>
                  </div>
                </div>
              </Panel>
              <Panel title="Subject Details"><SubjectDetail s={sel} pred={selPred} thr={thr} full /></Panel>
            </div>
          )}

          {page === "settings" && (
            <div className="two-col">
              <Panel title="Display" sub="Changes apply across all pages">
                <label className="setting">
                  <span>Abnormal Z-score threshold: <b>|Z| ≥ {thr}</b></span>
                  <input type="range" min="1" max="3" step="0.1" value={thr} onChange={(e) => setThr(+e.target.value)} />
                </label>
              </Panel>
              <Panel title="Connection & Data">
                <table className="table"><tbody>
                  <tr><td>API base URL</td><td>{API}</td></tr>
                  <tr><td>Subjects loaded</td><td>{subjects.length}</td></tr>
                  <tr><td>Data type</td><td>Synthetic (generated)</td></tr>
                </tbody></table>
                <p className="muted small">{summary.data_notice} This tool is for academic demonstration only and is not a medical diagnosis.</p>
              </Panel>
            </div>
          )}

          <footer className="foot">
            <ShieldCheck size={14} />{summary.data_notice}
          </footer>
        </div>
      </main>
    </div>
  );
}

/* ---------- loader ---------- */
export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const get = (p) => fetch(`${API}/${p}`).then((r) => { if (!r.ok) throw new Error(`${p}: ${r.status}`); return r.json(); });
    Promise.all([get("summary"), get("subjects"), get("correlations"), get("predictions"), get("predictions/subjects")])
      .then(([summary, subjects, corr, preds, predSubjects]) => setData({ summary, subjects, corr, preds, predSubjects }))
      .catch((e) => setError(e.message));
  }, []);
  if (error) return <div className="center-msg error">Could not load data ({error}). Is the backend running at {API}?</div>;
  if (!data) return <div className="center-msg">Loading NeuroVision…</div>;
  return <Dashboard data={data} />;
}