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

	if (loading) return <div className="loading-center"><div className="spinner" /><span className="spinner-text">Loading notifications…</span></div>;

	const unreadCount = notifications.filter((n) => !n.is_read).length;

	return (
		<div className="customer-page">
			<div className="page-header">
				<h1 className="hero-heading">Notifications</h1>
				<p className="hero-subtitle">
					{unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
				</p>
			</div>

			<div className="filter-tabs" style={{ marginBottom: "1.5rem" }}>
				<button className={`filter-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
				<button className={`filter-tab ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
					Unread {unreadCount > 0 && <span className="filter-tab-badge">{unreadCount}</span>}
				</button>
				{unreadCount > 0 && (
					<button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead} style={{ marginLeft: "auto" }}>
						✓ Mark All Read
					</button>
				)}
			</div>

			{notifications.length === 0 ? (
				<div className="empty-panel">
					<span className="empty-panel-icon">🔔</span>
					<p>{filter === "unread" ? "No unread notifications" : "No notifications yet"}</p>
				</div>
			) : (
				<div className="notification-list">
					{notifications.map((n) => (
						<div
							key={n.id}
							className={`notification-item ${!n.is_read ? "unread" : ""} animate-fade-in-up`}
						>
							<span className="notif-icon">{typeIcons[n.notification_type] || "🔔"}</span>
							<div className="notif-content">
								<h3 className="notif-title">{n.title}</h3>
								<p className="notif-message">{n.message}</p>
								<span className="notif-time">
									{new Date(n.created_at * 1000).toLocaleString()}
								</span>
							</div>
							{!n.is_read && (
								<button className="btn btn-ghost btn-sm" onClick={() => handleMarkRead(n.id)}>
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
