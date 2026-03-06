import React, { useEffect, useState } from "react";
import { notificationsApi } from "@/services/api/notifications";
import type { Notification } from "@/types";

export const NotificationsPage: React.FC = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "unread">("all");

	const fetchNotifications = async () => {
		try {
			const res = await notificationsApi.list(filter === "unread");
			setNotifications(res.data.notifications);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchNotifications();
	}, [filter]);

	const handleMarkRead = async (id: number) => {
		await notificationsApi.markRead(id);
		await fetchNotifications();
	};

	const handleMarkAllRead = async () => {
		await notificationsApi.markAllRead();
		await fetchNotifications();
	};

	const typeIcons: Record<string, string> = {
		queue_status: "🔢",
		offer: "🏷️",
		parking_expiry: "🅿️",
		complaint_response: "📩",
		loyalty: "⭐",
		system: "🔔",
	};

	if (loading) return <div className="loading-spinner" />;

	const unreadCount = notifications.filter((n) => !n.is_read).length;

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Notifications</h1>
				<p className="hero-subtitle">
					{unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
				</p>
			</div>

			<div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
				<div style={{ display: "flex", gap: "0.5rem" }}>
					<button className={`btn ${filter === "all" ? "btn-primary" : ""}`} onClick={() => setFilter("all")}>All</button>
					<button className={`btn ${filter === "unread" ? "btn-primary" : ""}`} onClick={() => setFilter("unread")}>Unread ({unreadCount})</button>
				</div>
				{unreadCount > 0 && (
					<button className="btn" onClick={handleMarkAllRead} style={{ marginLeft: "auto" }}>
						Mark All Read
					</button>
				)}
			</div>

			{notifications.length === 0 ? (
				<div className="section-card" style={{ textAlign: "center", padding: "3rem" }}>
					<p style={{ fontSize: "1.2rem", color: "var(--color-text-muted)" }}>
						{filter === "unread" ? "No unread notifications" : "No notifications yet"}
					</p>
				</div>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
					{notifications.map((n) => (
						<div
							key={n.id}
							className="section-card"
							style={{
								display: "flex",
								alignItems: "flex-start",
								gap: "1rem",
								opacity: n.is_read ? 0.7 : 1,
								borderLeft: n.is_read ? "3px solid transparent" : "3px solid var(--color-accent-strong)",
							}}
						>
							<span style={{ fontSize: "1.5rem" }}>{typeIcons[n.notification_type] || "🔔"}</span>
							<div style={{ flex: 1 }}>
								<h3 style={{ margin: 0, fontSize: "1rem" }}>{n.title}</h3>
								<p style={{ margin: "0.25rem 0 0", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{n.message}</p>
								<span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
									{new Date(n.created_at * 1000).toLocaleString()}
								</span>
							</div>
							{!n.is_read && (
								<button className="btn" style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }} onClick={() => handleMarkRead(n.id)}>
									Mark Read
								</button>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
