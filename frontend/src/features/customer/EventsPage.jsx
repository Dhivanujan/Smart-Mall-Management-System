import React, { useEffect, useMemo, useState } from "react";
import { eventsApi } from "@/services/api/events";

const DEMO_EVENTS = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "July 12-14, 2026",
    location: "Central Atrium",
    description: "Enjoy live performances from top local bands and artists. Free entry for all shoppers!",
    category: "Entertainment",
    image: "🎵"
  },
  {
    id: 2,
    title: "Kids Art Workshop",
    date: "Every Saturday",
    location: "Level 2, Kids Zone",
    description: "Creative painting and craft sessions for children aged 5-12. Materials provided.",
    category: "Family",
    image: "🎨"
  },
  {
    id: 3,
    title: "Tech Expo 2026",
    date: "August 5-8, 2026",
    location: "Convention Hall, Level 4",
    description: "Experience the latest gadgets and innovations from leading tech brands.",
    category: "Technology",
    image: "📱"
  },
  {
    id: 4,
    title: "Food & Wine Tasting",
    date: "September 10, 2026",
    location: "Gourmet Court",
    description: "Savor exquisite wines and dishes from our premium restaurants. Ticketed event.",
    category: "Dining",
    image: "🍷"
  }
];

export const EventsPage = () => {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const res = await eventsApi.listReminders();
        const ids = (res.data.reminders ?? []).map((item) => item.event_id);
        setSavedEventIds(ids);
      } catch {
        setMessage("Could not load reminders right now.");
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, []);

  const filteredEvents = useMemo(() => {
    return DEMO_EVENTS.filter((event) => {
      const categoryMatch = filter === "All" || event.category === filter;
      const q = query.trim().toLowerCase();
      const queryMatch =
        !q ||
        event.title.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q);

      return categoryMatch && queryMatch;
    });
  }, [filter, query]);

  const toggleReminder = async (event) => {
    try {
      if (savedEventIds.includes(event.id)) {
        await eventsApi.removeReminder(event.id);
        setSavedEventIds((prev) => prev.filter((id) => id !== event.id));
        setMessage("Reminder removed.");
      } else {
        await eventsApi.createReminder({
          event_id: event.id,
          event_title: event.title,
          event_date: event.date,
          event_location: event.location,
        });
        setSavedEventIds((prev) => [...prev, event.id]);
        setMessage("Reminder saved.");
      }
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "Failed to update reminder.");
    }
  };

  return (
    <div className="customer-page animate-fade-in">
      <div className="page-header">
        <h1 className="hero-heading">Events & Happenings</h1>
        <p className="hero-subtitle">Discover what's happening at SmartMall this season.</p>
      </div>

      {message && <div className="message-banner" style={{ marginBottom: "1rem" }}>{message}</div>}

      <div className="feature-toolbar events-toolbar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="feature-search"
          placeholder="Search events by title, location, or description"
          aria-label="Search events"
        />
        <div className="feature-kpi">
          <span className="feature-kpi-value">{filteredEvents.length}</span>
          <span>Showing</span>
        </div>
        <div className="feature-kpi">
          <span className="feature-kpi-value">{savedEventIds.length}</span>
          <span>Saved</span>
        </div>
      </div>

      <div className="events-filters">
        {["All", "Entertainment", "Family", "Technology", "Dining"].map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`event-filter-chip ${filter === cat ? "active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="events-grid">
        {filteredEvents.map((event, index) => (
          <div 
            key={event.id} 
            className={`event-card animate-fade-in-up stagger-${(index % 4) + 1}`}
          >
            <div className="event-card-cover">
              {event.image}
              <div className="event-category-pill">
                {event.category}
              </div>
            </div>
            
            <div className="event-card-body">
              <div className="event-date-row">
                📅 {event.date}
              </div>
              <h3 className="event-title">{event.title}</h3>
              <p className="event-desc">
                {event.description}
              </p>
              
              <div className="event-footer">
                <span className="event-location">
                  📍 {event.location}
                </span>
                <button
                  type="button"
                  className={`event-reminder-btn ${savedEventIds.includes(event.id) ? "saved" : ""}`}
                  onClick={() => toggleReminder(event)}
                  disabled={loading}
                >
                  {savedEventIds.includes(event.id) ? "Saved" : "Set Reminder"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel animate-fade-in-up" style={{ marginTop: "1.2rem" }}>
        <h2 className="panel-title">My Saved Event Reminders</h2>
        {loading ? (
          <p className="hero-subtitle" style={{ marginBottom: 0 }}>Loading reminders...</p>
        ) : savedEventIds.length === 0 ? (
          <p className="hero-subtitle" style={{ marginBottom: 0 }}>No reminders yet. Save events to get started.</p>
        ) : (
          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            You have {savedEventIds.length} saved reminder{savedEventIds.length > 1 ? "s" : ""}.
          </p>
        )}
      </div>

      {filteredEvents.length === 0 && (
        <div className="empty-panel" style={{ marginTop: "1rem" }}>
          <span className="empty-panel-icon">📭</span>
          <h3>No events found</h3>
          <p>Try a different category or update your search text.</p>
        </div>
      )}
    </div>
  );
};
