import React, { useEffect, useState } from "react";
import { parkingApi } from "@/services/api/parking";
import { useAuth } from "@/app/providers/AuthProvider";
import { useWebSocket } from "@/hooks/useWebSocket";
import { 
    ParkingSquare, CheckCircle, Car, MapPin, 
    BarChart2, AlertTriangle, Info, Ticket, ArrowRight 
} from "lucide-react";

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

    useWebSocket({
        url: "/ws/parking",
        onMessage: (data) => {
            if (data.type === "parking.update") {
                fetchData();
            }
        }
    });

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
					<Info className="w-5 h-5" />
					<span>{message}</span>
				</div>)}

			{summary && (<>
					<div className="stat-grid">
						<div className="stat-card animate-fade-in-up stagger-1 card-hover">
							<span className="stat-card-icon bg-purple-500/20 text-purple-600 p-2.5 rounded-xl"><ParkingSquare className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-semibold text-muted-foreground uppercase tracking-wider text-xs">Total Slots</span>
								<span className="stat-card-value text-3xl font-black">{summary.total_slots}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-2 card-hover">
							<span className="stat-card-icon bg-green-500/20 text-green-600 p-2.5 rounded-xl"><CheckCircle className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-semibold text-muted-foreground uppercase tracking-wider text-xs">Available</span>
								<span className="stat-card-value text-3xl font-black" style={{ color: "var(--color-success)" }}>{summary.available}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-3 card-hover">
							<span className="stat-card-icon bg-blue-500/20 text-blue-600 p-2.5 rounded-xl"><Car className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-semibold text-muted-foreground uppercase tracking-wider text-xs">Occupied</span>
								<span className="stat-card-value text-3xl font-black">{summary.occupied}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-4 card-hover">
							<span className="stat-card-icon bg-amber-500/20 text-amber-600 p-2.5 rounded-xl"><MapPin className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-semibold text-muted-foreground uppercase tracking-wider text-xs">Reserved</span>
								<span className="stat-card-value text-3xl font-black">{summary.reserved}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-5 card-hover">
							<span className="stat-card-icon bg-cyan-500/20 text-cyan-600 p-2.5 rounded-xl"><BarChart2 className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-semibold text-muted-foreground uppercase tracking-wider text-xs">Utilization</span>
								<span className="stat-card-value text-3xl font-black">{summary.utilization_percent}%</span>
							</span>
						</div>
						{summary.is_peak && (<div className="stat-card animate-fade-in-up stagger-6 card-hover" style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}>
								<span className="stat-card-icon bg-amber-500/20 text-amber-600 p-2.5 rounded-xl"><AlertTriangle className="w-6 h-6" /></span>
								<span className="stat-card-text">
									<span className="stat-card-label font-semibold text-muted-foreground uppercase tracking-wider text-xs">Peak Hour</span>
									<span className="stat-card-value text-xl font-bold uppercase tracking-widest mt-1" style={{ color: "var(--color-warning)" }}>Active</span>
								</span>
							</div>)}
					</div>

					<div className="panel">
						<h2 className="panel-title flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-500" /> Zone Availability</h2>
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
													<div className="zone-util-track relative overflow-hidden bg-secondary/50">
														<div className="zone-util-fill absolute inset-y-0 left-0 transition-all duration-1000 ease-out" style={{
                    width: `${stats.utilization_percent}%`,
                    background: stats.utilization_percent > 80
                        ? "linear-gradient(90deg, #ef4444, #f87171)"
                        : stats.utilization_percent > 50
                            ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                            : "linear-gradient(90deg, #22c55e, #4ade80)"
                }}/>
													</div>
												</div>
											</td>
										</tr>))}
								</tbody>
							</table>
						</div>
					</div>

					{user && (<div className="panel">
							<h2 className="panel-title flex items-center gap-2"><Ticket className="w-5 h-5 text-primary" /> Reserve a Parking Slot</h2>
							<div className="reserve-form">
								<div className="form-group">
									<label className="form-label">Preferred Zone</label>
									<select className="form-control" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
										<option value="">Any Zone</option>
										{Object.keys(summary.zone_stats).map((z) => (<option key={z} value={z}>Zone {z} ({summary.zone_stats[z].available} available)</option>))}
									</select>
								</div>
								<button className="btn btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }} onClick={handleReserve} disabled={actionLoading}>
									{actionLoading ? "Reserving..." : <>Reserve Slot <ArrowRight className="w-4 h-4" /></>}
								</button>
							</div>
						</div>)}

					{mySlots.length > 0 && (<div className="panel">
							<h2 className="panel-title flex items-center gap-2"><Car className="w-5 h-5 text-blue-500" /> My Parking</h2>
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
