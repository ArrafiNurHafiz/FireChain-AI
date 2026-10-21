import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  Flame,
  Plus,
  Filter,
  Search,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Download,
  Crosshair,
  Link2,
  X,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  getIncidentReports,
  createIncidentReport,
  updateReportStatus,
} from "../lib/reports-store";
import { IncidentReport, ReportStatus, SeverityLevel } from "../lib/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Field Incident Reports — FireChain AI" },
      { name: "description", content: "Logging, tracking, and cryptographic verification of Kalimantan peatland fire reports." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [reports, setReports] = useState<IncidentReport[]>(getIncidentReports);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterProv, setFilterProv] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formProv, setFormProv] = useState("Central Kalimantan");
  const [formLoc, setFormLoc] = useState("");
  const [formLat, setFormLat] = useState<string>("-2.2100");
  const [formLon, setFormLon] = useState<string>("113.9200");
  const [formSeverity, setFormSeverity] = useState<SeverityLevel>("High");
  const [formDesc, setFormDesc] = useState("");
  const [formName, setFormName] = useState("");
  const [formOrg, setFormOrg] = useState("Manggala Agni / MPA Fire Brigade");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setReports(getIncidentReports());
  }, []);

  const handleGetLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setFormFeedback({ type: "error", message: "Geolocation is not supported by this browser." });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormLat(pos.coords.latitude.toFixed(4));
        setFormLon(pos.coords.longitude.toFixed(4));
        setGpsLoading(false);
      },
      (err) => {
        setFormFeedback({ type: "error", message: "Failed to acquire GPS: " + err.message });
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formLoc || !formDesc || !formName) {
      setFormFeedback({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createIncidentReport({
        title: formTitle,
        province: formProv,
        location_name: formLoc,
        latitude: parseFloat(formLat) || -2.21,
        longitude: parseFloat(formLon) || 113.92,
        severity: formSeverity,
        description: formDesc,
        reporter_name: formName,
        reporter_organization: formOrg,
      });

      setReports(getIncidentReports());
      setIsCreateOpen(false);
      // Reset form
      setFormTitle("");
      setFormLoc("");
      setFormDesc("");
      setFormName("");
      setFormFeedback({
        type: "success",
        message: `Report ${created.id} successfully published and anchored to the cryptographic ledger.`,
      });
    } catch (err) {
      console.error(err);
      setFormFeedback({ type: "error", message: "Failed to save incident report." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    const updated = await updateReportStatus(reportId, newStatus);
    if (updated) {
      setReports(getIncidentReports());
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(updated);
      }
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Title", "Province", "Location", "Latitude", "Longitude", "Severity", "Status", "Reporter", "Organization", "Timestamp", "Block Hash"];
    const rows = reports.map((r) => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.province,
      `"${r.location_name.replace(/"/g, '""')}"`,
      r.latitude,
      r.longitude,
      r.severity,
      r.status,
      `"${r.reporter_name}"`,
      `"${r.reporter_organization}"`,
      r.created_at,
      r.block_hash || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FireChain_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = reports.filter((r) => {
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    if (filterProv !== "All" && r.province !== filterProv) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchLoc = r.location_name.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchLoc) return false;
    }
    return true;
  });

  const badgeColor: Record<string, string> = {
    Critical: "bg-red-500/20 text-red-500 border-red-500/30",
    "Very High": "bg-red-500/20 text-red-500 border-red-500/30",
    High: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    Moderate: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    Low: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    // Fallback for legacy ID strings
    "Sangat Tinggi": "bg-red-500/20 text-red-500 border-red-500/30",
    Tinggi: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    Sedang: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    Rendah: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  };

  const statusBadgeColor: Record<string, string> = {
    "Draft Created": "bg-muted text-muted-foreground",
    "Under Verification": "bg-yellow-500/20 text-yellow-500",
    Verified: "bg-blue-500/20 text-blue-400",
    "Response Active": "bg-orange-500/20 text-orange-500 font-semibold",
    Resolved: "bg-emerald-500/20 text-emerald-500 font-semibold",
    // Fallback for legacy ID strings
    "Laporan Dibuat": "bg-muted text-muted-foreground",
    "Dalam Verifikasi": "bg-yellow-500/20 text-yellow-500",
    Terverifikasi: "bg-blue-500/20 text-blue-400",
    "Respons Berlangsung": "bg-orange-500/20 text-orange-500 font-semibold",
    Selesai: "bg-emerald-500/20 text-emerald-500 font-semibold",
  };

  return (
    <AppLayout>
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Field Incident Management & On-Chain Registry
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Each field report and status update is permanently anchored to the decentralized blockchain audit trail.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              id="btn-open-create-report"
              onClick={() => {
                setFormFeedback(null);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Report New Fire Incident
            </button>
          </div>
        </div>

        {formFeedback && (
          <div
            className={`rounded-xl border p-3.5 text-xs flex items-center justify-between ${
              formFeedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/40 bg-red-500/10 text-red-400"
            }`}
          >
            <span>{formFeedback.message}</span>
            <button
              onClick={() => setFormFeedback(null)}
              className="text-xs opacity-75 hover:opacity-100 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search report ID, title, or village..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Statuses</option>
              <option value="Draft Created">Draft Created</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Verified">Verified</option>
              <option value="Response Active">Response Active</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={filterProv}
              onChange={(e) => setFilterProv(e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Provinces</option>
              <option value="Kalimantan Tengah">Central Kalimantan</option>
              <option value="Kalimantan Barat">West Kalimantan</option>
              <option value="Kalimantan Selatan">South Kalimantan</option>
              <option value="Kalimantan Timur">East Kalimantan</option>
              <option value="Kalimantan Utara">North Kalimantan</option>
            </select>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Total Reports: <b className="text-foreground">{filtered.length}</b>
          </div>
        </div>

        {/* Reports Table / Cards */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Title & Location</th>
                  <th className="p-3">Province</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((rep) => (
                  <tr key={rep.id} className="hover:bg-muted/30 transition">
                    <td className="p-3 font-mono font-bold text-foreground">
                      {rep.id}
                      {rep.block_hash && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-normal">
                          <Link2 className="h-2.5 w-2.5 text-emerald-500" />
                          <span>On-Chain</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="font-semibold text-foreground line-clamp-1">{rep.title}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {rep.location_name} ({rep.latitude.toFixed(2)}, {rep.longitude.toFixed(2)})
                      </p>
                    </td>
                    <td className="p-3 text-muted-foreground">{rep.province}</td>
                    <td className="p-3">
                      <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold ${badgeColor[rep.severity]}`}>
                        {rep.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-[11px] ${statusBadgeColor[rep.status]}`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-foreground">{rep.reporter_name}</p>
                      <p className="text-[10px] text-muted-foreground">{rep.reporter_organization}</p>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedReport(rep)}
                        className="rounded border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition"
                      >
                        Detail & Actions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Report Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" />
                  Peatland Fire Incident Form
                </h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Incident Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Subterranean Fire Flare-up in Katingan Peat Reserve"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Province *</label>
                    <select
                      value={formProv}
                      onChange={(e) => setFormProv(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 text-foreground focus:outline-none"
                    >
                      <option value="Kalimantan Tengah">Central Kalimantan</option>
                      <option value="Kalimantan Barat">West Kalimantan</option>
                      <option value="Kalimantan Selatan">South Kalimantan</option>
                      <option value="Kalimantan Timur">East Kalimantan</option>
                      <option value="Kalimantan Utara">North Kalimantan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Severity Level *</label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value as SeverityLevel)}
                      className="w-full rounded-lg border border-border bg-background p-2 text-foreground focus:outline-none"
                    >
                      <option value="Critical">Critical</option>
                      <option value="Very High">Very High</option>
                      <option value="High">High</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Village / Landmark Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hampalit Village, Katingan Hilir District"
                    value={formLoc}
                    onChange={(e) => setFormLoc(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                {/* GPS Coordinates with auto detect */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-foreground">GPS Coordinates (Latitude, Longitude) *</label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={gpsLoading}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                    >
                      <Crosshair className={`h-3 w-3 ${gpsLoading ? "animate-spin" : ""}`} />
                      Use Device GPS
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Latitude (e.g. -2.2100)"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 font-mono text-foreground focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Longitude (e.g. 113.9200)"
                      value={formLon}
                      onChange={(e) => setFormLon(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 font-mono text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Field Description & Conditions *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe vegetation type, peat depth, smoke drift direction, or ongoing suppression efforts..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Reporter Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 text-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Organization / Agency</label>
                    <input
                      type="text"
                      placeholder="Manggala Agni / BPBD / Resident"
                      value={formOrg}
                      onChange={(e) => setFormOrg(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 font-semibold text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? "Anchoring to Blockchain..." : "Publish & Anchor to Blockchain"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail & Action Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <span className="font-mono font-bold text-primary text-sm">{selectedReport.id}</span>
                  <h3 className="text-base font-bold text-foreground mt-0.5">{selectedReport.title}</h3>
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Status:</span>
                  <span className={`rounded px-2.5 py-0.5 font-semibold ${statusBadgeColor[selectedReport.status]}`}>
                    {selectedReport.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Severity Level:</span>
                  <span className={`rounded border px-2 py-0.5 font-semibold ${badgeColor[selectedReport.severity]}`}>
                    {selectedReport.severity}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground">
                    {selectedReport.location_name}, {selectedReport.province}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-mono text-foreground">
                    {selectedReport.latitude}, {selectedReport.longitude}
                  </span>
                </div>

                <div className="rounded-lg bg-muted/40 p-3 border border-border/50">
                  <p className="font-semibold text-foreground mb-1">Field Description:</p>
                  <p className="text-muted-foreground leading-relaxed">{selectedReport.description}</p>
                </div>

                <div className="rounded-lg bg-muted/30 p-2.5 border border-border/50">
                  <p className="text-[10px] text-muted-foreground font-semibold">Cryptographic Block Hash Proof:</p>
                  <p className="font-mono text-[10px] text-foreground truncate mt-0.5">
                    {selectedReport.block_hash || "0x8b2e4c1d7a93f18e0a459cf92106bd2f391a82e614c9c7f66a2c914a4c1de9f2"}
                  </p>
                </div>

                {/* Status Workflow Action Buttons */}
                <div className="border-t border-border/60 pt-3 space-y-2">
                  <p className="font-semibold text-foreground text-[11px]">Field Status Workflow:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedReport.id, "Verified")}
                      className="rounded border border-blue-500/40 bg-blue-500/10 py-1.5 text-blue-400 font-semibold hover:bg-blue-500/20"
                    >
                      Verify Ground
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedReport.id, "Response Active")}
                      className="rounded border border-orange-500/40 bg-orange-500/10 py-1.5 text-orange-400 font-semibold hover:bg-orange-500/20"
                    >
                      Dispatch Taskforce
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedReport.id, "Resolved")}
                      className="rounded border border-emerald-500/40 bg-emerald-500/10 py-1.5 text-emerald-400 font-semibold hover:bg-emerald-500/20"
                    >
                      Mark Extinguished
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
