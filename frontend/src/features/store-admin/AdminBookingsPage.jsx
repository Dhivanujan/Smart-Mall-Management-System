import React, { useEffect, useRef, useState } from "react";
import { moviesApi } from "@/services/api/movies";

const BOOKING_STATUSES = ["all", "booked", "cancelled", "completed"];

export const AdminBookingsPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [bulkStatus, setBulkStatus] = useState("booked");
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedBookingIds, setSelectedBookingIds] = useState([]);
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

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (usernameFilter.trim()) {
        params.username = usernameFilter.trim();
      }
      const res = await moviesApi.adminListBookings(params);
      setBookings(res.data.bookings ?? []);
      setSummary(res.data.summary ?? null);
      setSelectedBookingIds([]);
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "Failed to load bookings");
      setBookings([]);
      setSummary(null);
      setSelectedBookingIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (bookingId, nextStatus) => {
    try {
      await moviesApi.adminUpdateBookingStatus(bookingId, nextStatus);
      setMessage("Booking status updated");
      await fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "Failed to update booking status");
    }
  };

  const toggleRow = (bookingId) => {
    setSelectedBookingIds((prev) =>
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBookingIds.length === bookings.length) {
      setSelectedBookingIds([]);
      return;
    }
    setSelectedBookingIds(bookings.map((booking) => booking.id));
  };

  const runBulkStatusUpdate = async () => {
    if (selectedBookingIds.length === 0) {
      setMessage("Select at least one booking for bulk update.");
      return;
    }

    setShowBulkConfirm(true);
  };

  const confirmBulkStatusUpdate = async () => {
    setBulkUpdating(true);
    setBulkResult(null);

    const rowsById = Object.fromEntries(bookings.map((row) => [row.id, row]));

    try {
      const results = await Promise.allSettled(
        selectedBookingIds.map((bookingId) =>
          moviesApi.adminUpdateBookingStatus(bookingId, bulkStatus)
        )
      );

      const successes = [];
      const failures = [];

      results.forEach((result, index) => {
        const bookingId = selectedBookingIds[index];
        const row = rowsById[bookingId];
        if (result.status === "fulfilled") {
          successes.push({
            id: bookingId,
            username: row?.username ?? "unknown",
          });
          return;
        }

        failures.push({
          id: bookingId,
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
      await fetchBookings();
    } finally {
      setBulkUpdating(false);
      setShowBulkConfirm(false);
    }
  };

  const exportCsv = () => {
    if (bookings.length === 0) {
      setMessage("No booking rows to export.");
      return;
    }

    const header = [
      "id",
      "username",
      "movie_title",
      "showtime",
      "booking_status",
      "created_at",
    ];
    const rows = bookings.map((booking) => [
      booking.id,
      booking.username,
      booking.movie_title,
      booking.showtime,
      booking.booking_status,
      new Date(booking.created_at * 1000).toISOString(),
    ]);

    const toCsvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csvText = [header, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel-page">
      <div className="page-header">
        <h1 className="hero-heading">Movie Bookings</h1>
        <p className="hero-subtitle">Review and update cinema bookings for operations teams.</p>
      </div>

      {message && <div className="message-banner" style={{ marginBottom: "1rem" }}>{message}</div>}

      <div className="section-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "200px" }}
          >
            {BOOKING_STATUSES.map((status) => (
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
          <button className="btn" onClick={fetchBookings}>Apply Filters</button>
          <button className="btn btn-ghost" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      <div className="section-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Selected: {selectedBookingIds.length}
          </span>
          <select
            className="form-select"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            style={{ width: "200px" }}
          >
            {BOOKING_STATUSES.filter((status) => status !== "all").map((status) => (
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
                    <th>Booking ID</th>
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
          <div className="metric-card"><span className="metric-label">Booked</span><span className="metric-value">{summary.booked}</span></div>
          <div className="metric-card"><span className="metric-label">Cancelled</span><span className="metric-value">{summary.cancelled}</span></div>
          <div className="metric-card"><span className="metric-label">Completed</span><span className="metric-value">{summary.completed}</span></div>
        </div>
      )}

      <div className="section-card">
        {loading ? (
          <div className="loading-center"><div className="spinner"/><span className="spinner-text">Loading bookings...</span></div>
        ) : bookings.length === 0 ? (
          <div className="empty-panel"><span className="empty-panel-icon">🎬</span><p>No bookings found for current filters.</p></div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={bookings.length > 0 && selectedBookingIds.length === bookings.length}
                      onChange={toggleSelectAll}
                      aria-label="Select all bookings"
                    />
                  </th>
                  <th>ID</th>
                  <th>User</th>
                  <th>Movie</th>
                  <th>Showtime</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedBookingIds.includes(booking.id)}
                        onChange={() => toggleRow(booking.id)}
                        aria-label={`Select booking ${booking.id}`}
                      />
                    </td>
                    <td className="font-mono">#{booking.id}</td>
                    <td>{booking.username}</td>
                    <td>{booking.movie_title}</td>
                    <td>{booking.showtime}</td>
                    <td><span className={`booking-status ${booking.booking_status === "cancelled" ? "cancelled" : ""}`}>{booking.booking_status}</span></td>
                    <td>{new Date(booking.created_at * 1000).toLocaleString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        {BOOKING_STATUSES.filter((s) => s !== "all").map((status) => (
                          <button
                            key={status}
                            className="btn btn-ghost btn-sm"
                            disabled={booking.booking_status === status}
                            onClick={() => updateStatus(booking.id, status)}
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
            <h3 style={{ marginTop: 0 }}>Confirm Bulk Status Update</h3>
            <p style={{ color: "var(--color-text-muted)" }}>
              You are about to update <strong>{selectedBookingIds.length}</strong> booking(s) to
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
