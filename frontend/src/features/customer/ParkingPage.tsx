import React, { useEffect, useState } from "react";
import { parkingApi } from "@/services/api/parking";
import { useAuth } from "@/app/providers/AuthProvider";
import type { ParkingSummary, ParkingSlot } from "@/types";

export const ParkingPage: React.FC = () => {
	const { user } = useAuth();
	const [summary, setSummary] = useState<ParkingSummary | null>(null);
	const [mySlots, setMySlots] = useState<ParkingSlot[]>([]);
	const [selectedZone, setSelectedZone] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [message, setMessage] = useState("");

	const fetchData = async () => {
		try {
			const [summaryRes, mySlotsRes] = await Promise.all([
				parkingApi.getSummary(),
				user ? parkingApi.getMySlots().catch(() => ({ data: { slots: [] } })) : Promise.resolve({ data: { slots: [] } }),
			]);
			setSummary(summaryRes.data.parking);
			setMySlots(mySlotsRes.data.slots);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleReserve = async () => {
		setActionLoading(true);
		setMessage("");
		try {
			const res = await parkingApi.reserveSlot(selectedZone || undefined);
			setMessage(`Reserved slot ${res.data.slot.slot_id} in Zone ${res.data.slot.zone}`);
			await fetchData();
		} catch (err: any) {
			setMessage(err.response?.data?.detail ?? "Failed to reserve");
		} finally {
			setActionLoading(false);
		}
	};

	const handleRelease = async (slotId: string) => {
		setActionLoading(true);
		try {
			await parkingApi.releaseSlot(slotId);
			setMessage(`Slot ${slotId} released`);
			await fetchData();
		} catch (err: any) {
			setMessage(err.response?.data?.detail ?? "Failed to release");
		} finally {
			setActionLoading(false);
		}
	};

	if (loading) return <div className="loading-spinner" />;

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Parking Management</h1>
				<p className="hero-subtitle">View availability, reserve slots, and track your parking</p>
			</div>

			{message && (
				<div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>
					{message}
				</div>
			)}

			{summary && (
				<>
					<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
						<div className="metric-card">
							<span className="metric-icon">🅿️</span>
							<span className="metric-label">Total Slots</span>
							<span className="metric-value">{summary.total_slots}</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">✅</span>
							<span className="metric-label">Available</span>
							<span className="metric-value" style={{ color: "var(--color-success)" }}>{summary.available}</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">🚗</span>
							<span className="metric-label">Occupied</span>
							<span className="metric-value">{summary.occupied}</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">📌</span>
							<span className="metric-label">Reserved</span>
							<span className="metric-value">{summary.reserved}</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">📊</span>
							<span className="metric-label">Utilization</span>
							<span className="metric-value">{summary.utilization_percent}%</span>
						</div>
						{summary.is_peak && (
							<div className="metric-card" style={{ borderColor: "var(--color-warning)" }}>
								<span className="metric-icon">⚠️</span>
								<span className="metric-label">Peak Hour</span>
								<span className="metric-value" style={{ color: "var(--color-warning)" }}>Active</span>
							</div>
						)}
					</div>

					<div className="section-card" style={{ marginTop: "2rem" }}>
						<h2 className="section-title">Zone Availability</h2>
						<div className="data-table-wrapper">
							<table className="data-table">
								<thead>
									<tr>
										<th>Zone</th>
										<th>Total</th>
										<th>Available</th>
										<th>Occupied</th>
										<th>Reserved</th>
										<th>Utilization</th>
									</tr>
								</thead>
								<tbody>
									{Object.entries(summary.zone_stats).map(([zone, stats]) => (
										<tr key={zone}>
											<td><strong>Zone {zone}</strong></td>
											<td>{stats.total}</td>
											<td style={{ color: "var(--color-success)" }}>{stats.available}</td>
											<td>{stats.occupied}</td>
											<td>{stats.reserved}</td>
											<td>
												<div className="zone-bar">
													<div
														className="zone-bar-fill"
														style={{
															width: `${stats.utilization_percent}%`,
															backgroundColor: stats.utilization_percent > 80 ? "var(--color-danger)" : stats.utilization_percent > 50 ? "var(--color-warning)" : "var(--color-success)",
														}}
													/>
												</div>
												<span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{stats.utilization_percent}%</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{user && (
						<div className="section-card" style={{ marginTop: "2rem" }}>
							<h2 className="section-title">Reserve a Parking Slot</h2>
							<div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
								<div>
									<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
										Preferred Zone
									</label>
									<select className="filter-select" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
										<option value="">Any Zone</option>
										{Object.keys(summary.zone_stats).map((z) => (
											<option key={z} value={z}>Zone {z} ({summary.zone_stats[z].available} available)</option>
										))}
									</select>
								</div>
								<button className="btn btn-primary" onClick={handleReserve} disabled={actionLoading}>
									{actionLoading ? "Reserving..." : "Reserve Slot"}
								</button>
							</div>
						</div>
					)}

					{mySlots.length > 0 && (
						<div className="section-card" style={{ marginTop: "2rem" }}>
							<h2 className="section-title">My Parking</h2>
							<div className="data-table-wrapper">
								<table className="data-table">
									<thead>
										<tr>
											<th>Slot</th>
											<th>Zone</th>
											<th>Floor</th>
											<th>Status</th>
											<th>Duration</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{mySlots.map((slot) => (
											<tr key={slot.slot_id}>
												<td><strong>{slot.slot_id}</strong></td>
												<td>Zone {slot.zone}</td>
												<td>Floor {slot.floor}</td>
												<td><span className={`status-badge status-${slot.status === "reserved" ? "open" : "closed"}`}>{slot.status}</span></td>
												<td>{slot.duration_minutes > 0 ? `${slot.duration_minutes} min` : "—"}</td>
												<td>
													<button
														className="btn btn-ghost"
														onClick={() => handleRelease(slot.slot_id)}
														disabled={actionLoading}
														style={{ fontSize: "0.8rem" }}
													>
														Release
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};
