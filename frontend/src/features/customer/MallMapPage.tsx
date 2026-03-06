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

	if (loading) return <div className="loading-center"><div className="spinner" /><span className="spinner-text">Loading mall map…</span></div>;

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
		<div className="customer-page">
			<div className="page-header">
				<h1 className="hero-heading">Mall Map</h1>
				<p className="hero-subtitle">Find stores by floor, zone, and category</p>
			</div>

			<div className="floor-tabs">
				{floors.map((f) => (
					<button
						key={f}
						className={`floor-tab ${selectedFloor === f ? "active" : ""}`}
						onClick={() => { setSelectedFloor(f); setSelectedStore(null); }}
					>
						Floor {f}
					</button>
				))}
			</div>

			<div className="category-legend">
				{Object.entries(categoryColors).map(([cat, color]) => (
					<span key={cat} className="legend-item">
						<span className="legend-dot" style={{ background: color }} />
						{cat}
					</span>
				))}
			</div>

			<div className="map-layout">
				<div className="map-canvas panel">
					<h2 className="panel-title">🗺️ Floor {selectedFloor} Layout</h2>
					<div className="map-area">
						{zones.map((zone) => {
							const zoneStores = floorStores.filter((s) => s.zone === zone);
							const avgX = zoneStores.reduce((a, s) => a + s.coordinates.x, 0) / zoneStores.length;
							const avgY = zoneStores.reduce((a, s) => a + s.coordinates.y, 0) / zoneStores.length;
							return (
								<div key={zone} className="map-zone-label" style={{ left: `${avgX - 5}%`, top: `${avgY - 8}%` }}>
									{zone}
								</div>
							);
						})}
						{floorStores.map((store) => (
							<div
								key={store.id}
								title={store.name}
								className={`map-pin ${selectedStore?.id === store.id ? "selected" : ""}`}
								style={{
									left: `${store.coordinates.x}%`,
									top: `${store.coordinates.y}%`,
									background: categoryColors[store.category] || "#95a5a6",
								}}
								onClick={() => setSelectedStore(store)}
							/>
						))}
					</div>
				</div>

				<div className="map-sidebar panel">
					{selectedStore ? (
						<>
							<button className="btn btn-ghost btn-sm" onClick={() => setSelectedStore(null)} style={{ marginBottom: "1rem" }}>
								← Back to list
							</button>
							<h2 className="panel-title">{selectedStore.name}</h2>
							<div className="map-store-details">
								<div className="map-detail-row">
									<span className="map-detail-label">Category</span>
									<span className="map-detail-value" style={{ color: categoryColors[selectedStore.category] }}>{selectedStore.category}</span>
								</div>
								<div className="map-detail-row">
									<span className="map-detail-label">Floor</span>
									<span className="map-detail-value">{selectedStore.floor}</span>
								</div>
								<div className="map-detail-row">
									<span className="map-detail-label">Zone</span>
									<span className="map-detail-value">{selectedStore.zone}</span>
								</div>
								<a href={`/stores/${selectedStore.id}`} className="btn btn-primary" style={{ marginTop: "1rem", textAlign: "center", textDecoration: "none", width: "100%" }}>
									View Store Details →
								</a>
							</div>
						</>
					) : (
						<>
							<h2 className="panel-title">📍 Floor {selectedFloor} Stores</h2>
							{floorStores.length === 0 ? (
								<div className="empty-panel">
									<span className="empty-panel-icon">🏬</span>
									<p>No stores on this floor</p>
								</div>
							) : (
								<div className="map-store-list">
									{floorStores.map((store) => (
										<div
											key={store.id}
											className="map-store-item"
											onClick={() => setSelectedStore(store)}
										>
											<span className="map-store-dot" style={{ background: categoryColors[store.category] || "#95a5a6" }} />
											<span className="map-store-name">{store.name}</span>
											<span className="map-store-zone">{store.zone}</span>
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
