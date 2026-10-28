"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity, BarChart3, Bell, CalendarDays, ChevronDown, CircleHelp, Clock3,
  Download, Eye, FileBarChart, LayoutDashboard, Link2, Megaphone, MoreVertical,
  Pause, Play, PlusCircle, RefreshCw, Search, Settings, SlidersHorizontal,
  Sparkles, Target, Users, Wallet, X, Image as ImageIcon, ShieldCheck,
  UserRound, Workflow, Handshake, Palette, BriefcaseBusiness, Bot, MousePointerClick, ArrowUpDown
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

type Campaign = {
  id: string; name: string; platform: string; objective: string; status: string;
  daily_budget: number; impressions: number; clicks: number; spend: number;
  conversions: number; revenue: number;
};

const demoCampaigns: Campaign[] = [
  { id: "camp-1", name: "Targeted Sales Campaign 1", platform: "LinkedIn", objective: "Retargeting · Brand", status: "active", daily_budget: 48093, impressions: 868200, clicks: 11900, spend: 20065, conversions: 119, revenue: 80260 },
  { id: "camp-2", name: "Optimized Retargeting Campaign 2", platform: "Pinterest", objective: "Performance", status: "active", daily_budget: 38077, impressions: 667800, clicks: 9200, spend: 11788, conversions: 92, revenue: 32500 },
  { id: "camp-3", name: "Targeted Brand Campaign 3", platform: "Pinterest", objective: "Seasonal", status: "paused", daily_budget: 39383, impressions: 388900, clicks: 12800, spend: 15795, conversions: 128, revenue: 67500 },
  { id: "camp-4", name: "Dynamic Retargeting Campaign 4", platform: "LinkedIn", objective: "Launch · Evergreen", status: "active", daily_budget: 2451, impressions: 650400, clicks: 15900, spend: 533, conversions: 159, revenue: 21000 },
  { id: "camp-5", name: "Optimized Sales Campaign 5", platform: "Microsoft Ads", objective: "Seasonal · Launch", status: "draft", daily_budget: 33262, impressions: 238700, clicks: 10400, spend: 28515, conversions: 104, revenue: 143000 },
  { id: "camp-6", name: "Targeted Awareness Campaign 6", platform: "Snapchat", objective: "Acquisition", status: "paused", daily_budget: 26368, impressions: 948300, clicks: 25400, spend: 4328, conversions: 254, revenue: 55400 },
];

const money = (v: number) => "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v || 0);
const compact = (v: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v || 0);

function Platform({ name }: { name: string }) {
  const cfg: Record<string, { icon: string; cls: string }> = {
    LinkedIn: { icon: "▣", cls: "linkedin" }, Pinterest: { icon: "♟", cls: "pinterest" },
    "Microsoft Ads": { icon: "⌕", cls: "microsoft" }, Snapchat: { icon: "▣", cls: "snapchat" },
    Meta: { icon: "∞", cls: "meta" }, Google: { icon: "G", cls: "google" },
    TikTok: { icon: "♪", cls: "tiktok" }
  };
  const c = cfg[name] || { icon: "•", cls: "other" };
  return <span className={`platform-badge ${c.cls}`}><b>{c.icon}</b>{name}</span>;
}

function CampaignStatus({ status }: { status: string }) {
  return status === "paused"
    ? <span className="status-square paused"><Pause size={16} fill="currentColor" /></span>
    : status === "draft"
      ? <span className="status-square draft">✎</span>
      : <span className="status-square active"><Clock3 size={16} /></span>;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(demoCampaigns);
  const [apiConnected, setApiConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedNav, setSelectedNav] = useState("Campaigns");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<keyof Campaign>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", platform: "Meta", objective: "Conversions", daily_budget: "100" });

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/campaigns`);
      if (!res.ok) throw new Error("API unavailable");
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length) setCampaigns(json.data);
      setApiConnected(true);
      setError("");
    } catch { setApiConnected(false); }
  }, []);

  useEffect(() => { void loadCampaigns(); }, [loadCampaigns]);

  const filtered = campaigns
    .filter(c => `${c.name} ${c.platform} ${c.objective} ${c.status}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av ?? "").localeCompare(String(bv ?? ""));
      return sortAsc ? cmp : -cmp;
    });

  function changeSort(key: keyof Campaign) {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  function toggleSelected(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  const spend = campaigns.reduce((s, c) => s + Number(c.spend || 0), 0);
  const impressions = campaigns.reduce((s, c) => s + Number(c.impressions || 0), 0);
  const active = campaigns.filter(c => c.status === "active").length;
  const revenue = campaigns.reduce((s, c) => s + Number(c.revenue || 0), 0);
  const roas = spend ? revenue / spend : 0;

  async function createCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const res = await fetch(`${API}/api/campaigns`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, daily_budget: Number(form.daily_budget), status: "active" })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not create campaign.");
      }
      setShowCreate(false);
      setForm({ name: "", platform: "Meta", objective: "Conversions", daily_budget: "100" });
      await loadCampaigns();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create campaign."); }
    finally { setSaving(false); }
  }

  async function toggle(c: Campaign) {
    const status = c.status === "active" ? "paused" : "active";
    if (c.id.startsWith("camp-")) {
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, status } : x));
      return;
    }
    try {
      const res = await fetch(`${API}/api/campaigns/${c.id}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error();
      await loadCampaigns();
    } catch { setError("Unable to update campaign status."); }
  }

  function exportCsv() {
    const rows = [["Campaign", "Platform", "Status", "Budget", "Impressions", "Clicks", "Spend", "Conversions", "Revenue"],
      ...filtered.map(c => [c.name, c.platform, c.status, c.daily_budget, c.impressions, c.clicks, c.spend, c.conversions, c.revenue])];
    const csv = rows.map(row => row.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = "adtech-saas-campaigns.csv"; a.click(); URL.revokeObjectURL(url);
  }

  const nav = [
    { section: "NAVIGATION", items: [
      [LayoutDashboard, "Dashboard"], [Megaphone, "Campaigns"], [BarChart3, "Analytics"],
      [Workflow, "Customer Journey"], [FileBarChart, "Reports"], [SlidersHorizontal, "Report Builder"],
      [Bot, "AI Insights"], [Users, "Audience Manager"], [Target, "Audience Builder"],
      [Wallet, "Budget Management"], [ImageIcon, "Asset Library (DAM)"], [ShieldCheck, "Creative Approvals"],
      [Link2, "Platform Integration"], [Handshake, "Team Collaboration"], [Palette, "Brand Guidelines"],
      [Bell, "Notifications"], [UserRound, "Profile"], [Settings, "Settings"], [CircleHelp, "Help & Support"]
    ] as const }
  ];

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-symbol"><Megaphone size={18} fill="currentColor" /></span><span>Nexgile-MediaNex AI</span><button className="collapse">‹</button></div>
      {nav.map(g => <div className="nav-group" key={g.section}><div className="nav-heading">{g.section}</div>
        {g.items.map(([Icon, label]) => <button key={label} className={`nav-item ${label === selectedNav ? "selected" : ""}`} onClick={() => setSelectedNav(label)}><Icon size={14} /><span>{label}</span></button>)}
      </div>)}
      <div className="sidebar-foot"><span className={`connection-dot ${apiConnected ? "online" : ""}`} />{apiConnected ? "PostgreSQL connected" : "Demo data"}</div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="top-search"><Search size={14} /><input placeholder="Search anything..." value={search} onChange={e => setSearch(e.target.value)} /><button aria-label="Clear search" onClick={() => setSearch("")}>{search && <X size={13} />}</button></div>
        <div className="top-actions"><button className="bell-btn"><Bell size={17} /><i>5</i></button><div className="user-avatar"></div><div className="user-info">User<small>Role</small></div><ChevronDown size={13} /></div>
      </header>
      <div className="content">
        <div className="page-heading"><div><h1>Campaigns</h1><p>Monitor and manage your multi-channel campaigns</p></div><button className="create-btn" onClick={() => setShowCreate(true)}><PlusCircle size={13} fill="currentColor" /> Create Campaign</button></div>
        {error && <div className="error-banner">{error}</div>}
        <section className="stats-grid">
          <div className="stat-card"><div className="stat-top"><span className="stat-icon blue"><span>$</span></span><span className="trend">⌁ &nbsp;5.2%</span></div><strong>{money(spend || 15765595)}</strong><b>Total Spend</b><small>vs last period</small></div>
          <div className="stat-card"><div className="stat-top"><span className="stat-icon green"><Eye size={19} /></span><span className="trend">⌁ &nbsp;12.8%</span></div><strong>{compact(impressions || 602700000)}</strong><b>Total Impressions</b><small>vs last period</small></div>
          <div className="stat-card"><div className="stat-top"><span className="stat-icon gold"><Megaphone size={18} fill="currentColor" /></span></div><strong>{active || 262}</strong><b>Active Campaigns</b><small>of {Math.max(campaigns.length, 1200)} total</small></div>
          <div className="stat-card"><div className="stat-top"><span className="stat-icon blue"><BarChart3 size={18} /></span><span className="trend">Target: 3.0x</span></div><strong>{(roas || 140.15).toFixed(2)}x</strong><b>Average ROAS</b><small>Return on Ad Spend</small></div>
        </section>
        <div className="table-heading"><div className="table-title"><h2>{selectedNav}</h2><span className="count-pill">{apiConnected ? campaigns.length : 1200}</span>{selectedIds.length > 0 && <span className="selection-count">{selectedIds.length} selected</span>}</div><div className="table-tools"><span className="updated"><Clock3 size={12} /> Updated Just now</span><button className="refresh-btn" onClick={() => void loadCampaigns()} title="Refresh"><RefreshCw size={15} /></button><button className="export-btn" onClick={exportCsv}><Download size={14} /> Export</button></div></div>
        <div className="table-card"><div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Select all campaigns" checked={filtered.length > 0 && filtered.every(c => selectedIds.includes(c.id))} onChange={e => setSelectedIds(e.target.checked ? filtered.map(c => c.id) : [])} /></th><th>Status</th><th><button className="sort-button" onClick={() => changeSort("name")}>Campaign Name <ArrowUpDown size={11} /></button></th><th><button className="sort-button" onClick={() => changeSort("platform")}>Platform <ArrowUpDown size={11} /></button></th><th>Date Range</th><th><button className="sort-button" onClick={() => changeSort("daily_budget")}>Budget <ArrowUpDown size={11} /></button></th><th><button className="sort-button" onClick={() => changeSort("impressions")}>Key Metrics <ArrowUpDown size={11} /></button></th><th>Health</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map((c, i) => {
            const budget = Number(c.daily_budget || 0), spent = Number(c.spend || 0), pct = budget ? Math.min(100, Math.round(spent / budget * 100)) : 0;
            const ctr = Number(c.impressions) ? Number(c.clicks) / Number(c.impressions) * 100 : 0;
            const health = [79, 71, 91, 92, 91, 86, 88, 83, 89, 94][i % 10];
            const dates = [["Dec 23, 2025", "Jan 5, 2026"], ["Dec 17, 2025", "Jan 28, 2026"], ["Dec 9, 2025", "Feb 2, 2026"], ["Dec 26, 2025", "Jan 19, 2026"], ["Dec 21, 2025", "Feb 26, 2026"], ["Dec 3, 2025", "Jan 13, 2026"]][i % 6];
            return <tr key={c.id} className={selectedIds.includes(c.id) ? "row-selected" : ""}><td><input type="checkbox" aria-label={`Select ${c.name}`} checked={selectedIds.includes(c.id)} onChange={() => toggleSelected(c.id)} /></td><td><CampaignStatus status={c.status} /></td>
              <td className="campaign-cell"><strong>{c.name}</strong><small>ID: {c.id}</small><div className="tags">{(c.objective || "Performance").split("·").map(t => <span key={t}>{t.trim()}</span>)}</div></td>
              <td><Platform name={c.platform} /></td><td className="date-cell"><CalendarDays size={13} /> {dates[0]} - {dates[1]}</td>
              <td className="budget-cell"><div><strong>{money(spent)}</strong><span> / {money(budget)}</span></div><div className="budget-bar"><span style={{ width: `${pct}%` }} /></div><small>{pct}% spent</small></td>
              <td><div className="metrics"><span><Eye size={12} />{compact(Number(c.impressions || 0))}</span><span><MousePointerClick size={12} />{compact(Number(c.clicks || 0))}</span><span><BarChart3 size={12} />{(Number(c.revenue || 0) / Math.max(Number(c.spend || 1), 1)).toFixed(2)}x</span><span><Target size={12} />{ctr.toFixed(1)}%</span></div></td>
              <td><span className={`health ${health >= 90 ? "good" : "mid"}`}>{health}</span></td><td><div className="actions">{c.status === "active" ? <button title="Pause campaign" onClick={() => void toggle(c)}><Pause size={14} fill="currentColor" /></button> : <button title="Activate campaign" onClick={() => void toggle(c)}><Play size={14} fill="currentColor" /></button>}<button title="More actions" onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}><MoreVertical size={15} /></button>{openMenu === c.id && <div className="row-menu"><button onClick={() => { void toggle(c); setOpenMenu(null); }}>{c.status === "active" ? "Pause campaign" : "Activate campaign"}</button><button onClick={() => { navigator.clipboard?.writeText(c.id); setOpenMenu(null); }}>Copy campaign ID</button></div>}</div></td></tr>;
          })}{filtered.length === 0 && <tr><td colSpan={9} className="empty">No campaigns found.</td></tr>}</tbody></table></div></div>
        <div className="footer-note"><span className={`connection-dot ${apiConnected ? "online" : ""}`} />{apiConnected ? "Connected to PostgreSQL campaign data" : "Preview mode · connect the API to load PostgreSQL data"}<span className="footer-spacer" />Showing {filtered.length} campaigns</div>
      </div>
    </main>
    {showCreate && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowCreate(false); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><h2 id="modal-title">Create Campaign</h2><p>Set up a new multi-channel campaign.</p></div><button className="close" onClick={() => setShowCreate(false)}><X size={17} /></button></div><form className="form-grid" onSubmit={createCampaign}><label>Campaign name<input required minLength={2} maxLength={180} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Holiday retargeting" /></label><label>Platform<select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>{["Meta", "Google", "TikTok", "LinkedIn", "Pinterest", "Microsoft Ads", "Snapchat", "Other"].map(x => <option key={x}>{x}</option>)}</select></label><label>Objective<select value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })}>{["Conversions", "Traffic", "Awareness", "Leads", "App installs"].map(x => <option key={x}>{x}</option>)}</select></label><label>Daily budget (USD)<input type="number" min="0" step=".01" required value={form.daily_budget} onChange={e => setForm({ ...form, daily_budget: e.target.value })} /></label><div className="modal-actions"><button type="button" className="cancel" onClick={() => setShowCreate(false)}>Cancel</button><button className="create-btn" disabled={saving}>{saving ? "Creating..." : "Create Campaign"}</button></div></form></div></div>}
  </div>;
}
