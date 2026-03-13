import React, { useEffect, useState } from "react";
import { parkingApi } from "@/services/api/parking";
import { useAuth } from "@/app/providers/AuthProvider";
export const ParkingPage = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [mySlots, setMySlots] = useState([]);
    const [selectedZone, setSelectedZone] = useState("");
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
        }
        catch {
            // ignore
        }
        finally {
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
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Failed to reserve");
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleRelease = async (slotId) => {
        setActionLoading(true);
        try {
            await parkingApi.releaseSlot(slotId);
            setMessage(`Slot ${slotId} released`);
            await fetchData();
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Failed to release");
        }
        finally {
            setActionLoading(false);
        }
    };
    if (loading)
        return <div className="loading-center"><div className="spinner"/><span className="spinner-text">Loading parking data…</span></div>;
    return (<div className="customer-page">
			<div className="page-header">
				<h1 className="hero-heading">Parking Management</h1>
				<p className="hero-subtitle">View availability, reserve slots, and track your parking</p>
			</div>

			{message && (<div className="message-banner info">
					<span>ℹ️</span>
					<span>{message}</span>
				</div>)}

			{summary && (<>
					<div className="stat-grid">
						<div className="stat-card animate-fade-in-up stagger-1">
							<span className="stat-card-icon purple">🅿️</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Total Slots</span>
								<span className="stat-card-value">{summary.total_slots}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-2">
							<span className="stat-card-icon green">✅</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Available</span>
								<span className="stat-card-value" style={{ color: "var(--color-success)" }}>{summary.available}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-3">
							<span className="stat-card-icon blue">🚗</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Occupied</span>
								<span className="stat-card-value">{summary.occupied}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-4">
							<span className="stat-card-icon amber">📌</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Reserved</span>
								<span className="stat-card-value">{summary.reserved}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-5">
							<span className="stat-card-icon cyan">📊</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Utilization</span>
								<span className="stat-card-value">{summary.utilization_percent}%</span>
							</span>
						</div>
						{summary.is_peak && (<div className="stat-card animate-fade-in-up stagger-6" style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}>
								<span className="stat-card-icon amber">⚠️</span>
								<span className="stat-card-text">
									<span className="stat-card-label">Peak Hour</span>
									<span className="stat-card-value" style={{ color: "var(--color-warning)" }}>Active</span>
								</span>
							</div>)}
					</div>

					<div className="panel">
						<h2 className="panel-title">📍 Zone Availability</h2>
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
									{Object.entries(summary.zone_stats).map(([zone, stats]) => (<tr key={zone}>
											<td><strong>Zone {zone}</strong></td>
											<td>{stats.total}</td>
											<td style={{ color: "var(--color-success)", fontWeight: 600 }}>{stats.available}</td>
											<td>{stats.occupied}</td>
											<td>{stats.reserved}</td>
											<td>
												<div className="zone-util-bar">
													<div className="zone-util-track">
														<div className="zone-util-fill" style={{
                    width: `${stats.utilization_percent}%`,
                    background: stats.utilization_percent > 80
                        ? "linear-gradient(90deg, #ef4444, #f87171)"
                        : stats.utilization_percent > 50
                            ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                            : "linear-gradient(90deg, #22c55e, #4ade80)",
                }}/>
													</div>
													<span className="zone-util-label">{stats.utilization_percent}%</span>
												</div>
											</td>
										</tr>))}
								</tbody>
							</table>
						</div>
					</div>

					{user && (<div className="panel">
							<h2 className="panel-title">🎫 Reserve a Parking Slot</h2>
							<div className="reserve-form">
								<div className="form-group">
									<label className="form-label">Preferred Zone</label>
									<select className="form-control" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
										<option value="">Any Zone</option>
										{Object.keys(summary.zone_stats).map((z) => (<option key={z} value={z}>Zone {z} ({summary.zone_stats[z].available} available)</option>))}
									</select>
								</div>
								<button className="btn btn-primary" onClick={handleReserve} disabled={actionLoading}>
									{actionLoading ? "Reserving..." : "Reserve Slot →"}
								</button>
							</div>
						</div>)}

					{mySlots.length > 0 && (<div className="panel">
							<h2 className="panel-title">🚗 My Parking</h2>
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
										{mySlots.map((slot) => (<tr key={slot.slot_id}>
												<td><strong>{slot.slot_id}</strong></td>
												<td>Zone {slot.zone}</td>
												<td>Floor {slot.floor}</td>
												<td>
													<span className={`status-badge ${slot.status === "reserved" ? "active" : "inactive"}`}>
														<span className="dot"/>
														{slot.status}
													</span>
												</td>
												<td>{slot.duration_minutes > 0 ? `${slot.duration_minutes} min` : "—"}</td>
												<td>
													<button className="btn btn-ghost btn-sm" onClick={() => handleRelease(slot.slot_id)} disabled={actionLoading}>
														Release
													</button>
												</td>
											</tr>))}
									</tbody>
								</table>
							</div>
						</div>)}
				</>)}
		</div>);
};
