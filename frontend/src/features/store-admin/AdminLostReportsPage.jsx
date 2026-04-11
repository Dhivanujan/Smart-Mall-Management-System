import React, { useEffect, useRef, useState } from "react";
import { lostFoundApi } from "@/services/api/lostFound";

const REPORT_STATUSES = ["all", "open", "in_progress", "matched", "closed"];

export const AdminLostReportsPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [bulkStatus, setBulkStatus] = useState("open");
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (!showBulkConfirm) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;

    window.requestAnimationFrame(() => {
      confirmButtonRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!bulkUpdating) {
          setShowBulkConfirm(false);
        }
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = modalRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        if (!bulkUpdating) {
          confirmBulkStatusUpdate();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [showBulkConfirm, bulkUpdating]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (usernameFilter.trim()) {
        params.username = usernameFilter.trim();
      }
      const res = await lostFoundApi.adminListReports(params);
      setReports(res.data.reports ?? []);
      setSummary(res.data.summary ?? null);
      setSelectedReportIds([]);
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "Failed to load lost reports");
      setReports([]);
      setSummary(null);
      setSelectedReportIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (reportId, nextStatus) => {
    try {
      await lostFoundApi.adminUpdateReportStatus(reportId, nextStatus);
      setMessage("Report status updated");
      await fetchReports();
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "Failed to update report status");
    }
  };

  const toggleRow = (reportId) => {
    setSelectedReportIds((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReportIds.length === reports.length) {
      setSelectedReportIds([]);
      return;
    }
    setSelectedReportIds(reports.map((report) => report.id));
  };

  const runBulkStatusUpdate = async () => {
    if (selectedReportIds.length === 0) {
      setMessage("Select at least one report for bulk update.");
      return;
    }

    setShowBulkConfirm(true);
  };

  const confirmBulkStatusUpdate = async () => {
    setBulkUpdating(true);
    setBulkResult(null);

    const rowsById = Object.fromEntries(reports.map((row) => [row.id, row]));

    try {
      const results = await Promise.allSettled(
        selectedReportIds.map((reportId) =>
          lostFoundApi.adminUpdateReportStatus(reportId, bulkStatus)
        )
      );

      const successes = [];
      const failures = [];

      results.forEach((result, index) => {
        const reportId = selectedReportIds[index];
        const row = rowsById[reportId];
        if (result.status === "fulfilled") {
          successes.push({
            id: reportId,
            username: row?.username ?? "unknown",
          });
          return;
        }

        failures.push({
          id: reportId,
          username: row?.username ?? "unknown",
          error:
            result.reason?.response?.data?.detail ??
            result.reason?.message ??
            "Request failed",
        });
      });

      setBulkResult({ successes, failures, status: bulkStatus });
      setMessage(
        `Bulk update finished: ${successes.length} succeeded, ${failures.length} failed.`
      );
      await fetchReports();
    } finally {
      setBulkUpdating(false);
      setShowBulkConfirm(false);
    }
  };

  const exportCsv = () => {
    if (reports.length === 0) {
      setMessage("No report rows to export.");
      return;
    }

    const header = [
      "id",
      "username",
      "item_description",
      "last_seen_location",
      "contact_phone",
      "status",
      "created_at",
    ];
    const rows = reports.map((report) => [
      report.id,
      report.username,
      report.item_description,
      report.last_seen_location,
      report.contact_phone,
      report.status,
      new Date(report.created_at * 1000).toISOString(),
    ]);

    const toCsvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csvText = [header, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-lost-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel-page">
      <div className="page-header">
        <h1 className="hero-heading">Lost Reports</h1>
        <p className="hero-subtitle">Track customer lost-item cases and keep statuses up to date.</p>
      </div>

      {message && <div className="message-banner" style={{ marginBottom: "1rem" }}>{message}</div>}

      <div className="section-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "220px" }}
          >
            {REPORT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All statuses" : status}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-input"
            placeholder="Filter by username"
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            style={{ width: "220px" }}
          />
          <button className="btn" onClick={fetchReports}>Apply Filters</button>
          <button className="btn btn-ghost" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      <div className="section-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Selected: {selectedReportIds.length}
          </span>
          <select
            className="form-select"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            style={{ width: "220px" }}
          >
            {REPORT_STATUSES.filter((status) => status !== "all").map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={runBulkStatusUpdate}>Apply Bulk Status</button>
        </div>
      </div>

      {bulkResult && (
        <div className="section-card" style={{ marginBottom: "1rem" }}>
          <h3 style={{ marginTop: 0, marginBottom: "0.6rem" }}>Last Bulk Update Result</h3>
          <p style={{ marginTop: 0, color: "var(--color-text-muted)" }}>
            Target status: <strong>{bulkResult.status}</strong>
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <span className="status-badge active">Success: {bulkResult.successes.length}</span>
            <span className="status-badge pending">Failed: {bulkResult.failures.length}</span>
          </div>
          {bulkResult.failures.length > 0 && (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>User</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResult.failures.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono">#{item.id}</td>
                      <td>{item.username}</td>
                      <td>{item.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {summary && (
        <div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: "1rem" }}>
          <div className="metric-card"><span className="metric-label">Total</span><span className="metric-value">{summary.total}</span></div>
          <div className="metric-card"><span className="metric-label">Open</span><span className="metric-value">{summary.open}</span></div>
          <div className="metric-card"><span className="metric-label">In Progress</span><span className="metric-value">{summary.in_progress}</span></div>
          <div className="metric-card"><span className="metric-label">Matched</span><span className="metric-value">{summary.matched}</span></div>
          <div className="metric-card"><span className="metric-label">Closed</span><span className="metric-value">{summary.closed}</span></div>
        </div>
      )}

      <div className="section-card">
        {loading ? (
          <div className="loading-center"><div className="spinner"/><span className="spinner-text">Loading reports...</span></div>
        ) : reports.length === 0 ? (
          <div className="empty-panel"><span className="empty-panel-icon">📦</span><p>No reports found for current filters.</p></div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={reports.length > 0 && selectedReportIds.length === reports.length}
                      onChange={toggleSelectAll}
                      aria-label="Select all reports"
                    />
                  </th>
                  <th>ID</th>
                  <th>User</th>
                  <th>Item</th>
                  <th>Last Seen</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedReportIds.includes(report.id)}
                        onChange={() => toggleRow(report.id)}
                        aria-label={`Select report ${report.id}`}
                      />
                    </td>
                    <td className="font-mono">#{report.id}</td>
                    <td>{report.username}</td>
                    <td>{report.item_description}</td>
                    <td>{report.last_seen_location}</td>
                    <td>{report.contact_phone}</td>
                    <td><span className="status-badge pending">{report.status}</span></td>
                    <td>{new Date(report.created_at * 1000).toLocaleString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        {REPORT_STATUSES.filter((s) => s !== "all").map((status) => (
                          <button
                            key={status}
                            className="btn btn-ghost btn-sm"
                            disabled={report.status === status}
                            onClick={() => updateStatus(report.id, status)}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showBulkConfirm && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-reports-dialog-title"
          aria-describedby="bulk-reports-dialog-description"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.68)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
            padding: "1rem",
          }}
        >
          <div
            className="section-card"
            style={{
              width: "min(560px, 100%)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <h3 id="bulk-reports-dialog-title" style={{ marginTop: 0 }}>Confirm Bulk Status Update</h3>
            <p id="bulk-reports-dialog-description" style={{ color: "var(--color-text-muted)" }}>
              You are about to update <strong>{selectedReportIds.length}</strong> report(s) to
              <strong> {bulkStatus}</strong>.
            </p>
            <p style={{ marginTop: "-0.25rem", color: "var(--color-text-dim)", fontSize: "0.85rem" }}>
              Shortcuts: Esc closes this dialog. Ctrl/Cmd + Enter confirms the update.
            </p>
            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
              <button
                ref={cancelButtonRef}
                className="btn btn-ghost"
                onClick={() => setShowBulkConfirm(false)}
                disabled={bulkUpdating}
              >
                Cancel
              </button>
              <button ref={confirmButtonRef} className="btn btn-primary" onClick={confirmBulkStatusUpdate} disabled={bulkUpdating}>
                {bulkUpdating ? "Updating..." : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
