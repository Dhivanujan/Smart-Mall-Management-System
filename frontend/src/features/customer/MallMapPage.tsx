import React, { useEffect, useState } from "react";
import { storesApi } from "@/services/api/stores";

interface MapStore {
	id: string;
	name: string;
	category: string;
	floor: number;
	zone: string;
	coordinates: { x: number; y: number };
}

export const MallMapPage: React.FC = () => {
	const [stores, setStores] = useState<MapStore[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedFloor, setSelectedFloor] = useState(1);
	const [selectedStore, setSelectedStore] = useState<MapStore | null>(null);

	useEffect(() => {
		storesApi.getMap().then((res) => {
			setStores(res.data.stores);
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	if (loading) return <div className="loading-spinner" />;

	const floors = [...new Set(stores.map((s) => s.floor))].sort();
	const floorStores = stores.filter((s) => s.floor === selectedFloor);
	const zones = [...new Set(floorStores.map((s) => s.zone))].sort();

	const categoryColors: Record<string, string> = {
		Fashion: "#e74c3c",
		Electronics: "#3498db",
		"Food & Beverage": "#f39c12",
		Sports: "#27ae60",
		Lifestyle: "#9b59b6",
		Grocery: "#1abc9c",
		Entertainment: "#e67e22",
		Health: "#2ecc71",
	};

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Mall Map</h1>
				<p className="hero-subtitle">Find stores by floor, zone, and category</p>
			</div>

			<div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
				{floors.map((f) => (
					<button
						key={f}
						className={`btn ${selectedFloor === f ? "btn-primary" : ""}`}
						onClick={() => { setSelectedFloor(f); setSelectedStore(null); }}
					>
						Floor {f}
					</button>
				))}
			</div>

			<div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
				{Object.entries(categoryColors).map(([cat, color]) => (
					<span key={cat} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
						<span style={{ width: 12, height: 12, borderRadius: "50%", background: color, display: "inline-block" }} />
						{cat}
					</span>
				))}
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
				{/* Map Area */}
				<div className="section-card" style={{ position: "relative", minHeight: "400px", background: "var(--bg-primary)" }}>
					<h2 className="section-title">Floor {selectedFloor} Layout</h2>
					<div style={{ position: "relative", width: "100%", height: "350px", border: "2px solid var(--border-primary)", borderRadius: "8px", overflow: "hidden" }}>
						{/* Zone labels */}
						{zones.map((zone) => {
							const zoneStores = floorStores.filter((s) => s.zone === zone);
							const avgX = zoneStores.reduce((a, s) => a + s.coordinates.x, 0) / zoneStores.length;
							const avgY = zoneStores.reduce((a, s) => a + s.coordinates.y, 0) / zoneStores.length;
							return (
								<div key={zone} style={{
									position: "absolute",
									left: `${avgX - 5}%`,
									top: `${avgY - 8}%`,
									fontSize: "0.7rem",
									fontWeight: 700,
									color: "var(--color-text-muted)",
									textTransform: "uppercase",
									letterSpacing: "0.1em",
								}}>
									{zone}
								</div>
							);
						})}
						{/* Store pins */}
						{floorStores.map((store) => (
							<div
								key={store.id}
								title={store.name}
								style={{
									position: "absolute",
									left: `${store.coordinates.x}%`,
									top: `${store.coordinates.y}%`,
									width: selectedStore?.id === store.id ? 24 : 18,
									height: selectedStore?.id === store.id ? 24 : 18,
									borderRadius: "50%",
									background: categoryColors[store.category] || "#95a5a6",
									border: selectedStore?.id === store.id ? "3px solid #fff" : "2px solid rgba(255,255,255,0.5)",
									boxShadow: selectedStore?.id === store.id ? "0 0 12px rgba(0,0,0,0.4)" : "0 2px 4px rgba(0,0,0,0.2)",
									cursor: "pointer",
									transform: "translate(-50%, -50%)",
									transition: "all 0.2s",
									zIndex: selectedStore?.id === store.id ? 10 : 1,
								}}
								onClick={() => setSelectedStore(store)}
							/>
						))}
					</div>
				</div>

				{/* Store List / Details */}
				<div className="section-card" style={{ maxHeight: "500px", overflowY: "auto" }}>
					{selectedStore ? (
						<>
							<button className="btn" onClick={() => setSelectedStore(null)} style={{ marginBottom: "1rem", fontSize: "0.8rem" }}>
								← Back to list
							</button>
							<h2 style={{ margin: "0 0 0.5rem" }}>{selectedStore.name}</h2>
							<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
								<div>
									<span style={{ color: "var(--color-text-muted)" }}>Category: </span>
									<span style={{ color: categoryColors[selectedStore.category], fontWeight: 600 }}>{selectedStore.category}</span>
								</div>
								<div>
									<span style={{ color: "var(--color-text-muted)" }}>Floor: </span>{selectedStore.floor}
								</div>
								<div>
									<span style={{ color: "var(--color-text-muted)" }}>Zone: </span>{selectedStore.zone}
								</div>
								<a href={`/stores/${selectedStore.id}`} className="btn btn-primary" style={{ marginTop: "1rem", textAlign: "center", textDecoration: "none" }}>
									View Store Details
								</a>
							</div>
						</>
					) : (
						<>
							<h2 className="section-title">Stores on Floor {selectedFloor}</h2>
							{floorStores.length === 0 ? (
								<p style={{ color: "var(--color-text-muted)" }}>No stores on this floor</p>
							) : (
								<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
									{floorStores.map((store) => (
										<div
											key={store.id}
											style={{
												padding: "0.5rem",
												borderRadius: "6px",
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "0.5rem",
												transition: "background 0.2s",
											}}
											onClick={() => setSelectedStore(store)}
											onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
											onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
										>
											<span style={{
												width: 12,
												height: 12,
												borderRadius: "50%",
												background: categoryColors[store.category] || "#95a5a6",
												flexShrink: 0,
											}} />
											<span style={{ fontSize: "0.9rem" }}>{store.name}</span>
											<span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "auto" }}>{store.zone}</span>
										</div>
									))}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};
