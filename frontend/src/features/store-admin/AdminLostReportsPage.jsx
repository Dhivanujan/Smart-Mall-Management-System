import React, { useEffect, useState } from "react";
import { lostFoundApi } from "@/services/api/lostFound";

const REPORT_STATUSES = ["all", "open", "in_progress", "matched", "closed"];

export const AdminLostReportsPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
      setMessage("");
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "Failed to load lost reports");
      setReports([]);
      setSummary(null);
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
        </div>
      </div>

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
    </div>
  );
};
