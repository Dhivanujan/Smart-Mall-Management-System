import React, { useEffect, useState } from "react";
import { moviesApi } from "@/services/api/movies";

const BOOKING_STATUSES = ["all", "booked", "cancelled", "completed"];

export const AdminBookingsPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
      setMessage("");
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "Failed to load bookings");
      setBookings([]);
      setSummary(null);
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
