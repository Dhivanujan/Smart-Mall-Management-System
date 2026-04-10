import React, { useEffect, useState } from "react";
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
      setMessage("");
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

    try {
      await Promise.all(
        selectedBookingIds.map((bookingId) =>
          moviesApi.adminUpdateBookingStatus(bookingId, bulkStatus)
        )
      );
      setMessage(`Updated ${selectedBookingIds.length} booking(s) to ${bulkStatus}.`);
      await fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "Bulk update failed.");
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
    </div>
  );
};
