import React, { useState } from "react";

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

  const filteredEvents = filter === "All" 
    ? DEMO_EVENTS 
    : DEMO_EVENTS.filter(e => e.category === filter);

  return (
    <div className="customer-page animate-fade-in">
      <div className="page-header">
        <h1 className="hero-heading">Events & Happenings</h1>
        <p className="hero-subtitle">Discover what's happening at SmartMall this season.</p>
      </div>

      <div className="events-filters" style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
        {["All", "Entertainment", "Family", "Technology", "Dining"].map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`btn ${filter === cat ? "btn-primary" : "btn-secondary"}`}
            style={{ 
              borderRadius: "2rem",
              padding: "0.5rem 1.25rem",
              fontSize: "0.9rem",
              transition: "all 0.2s ease"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="events-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "2rem"
      }}>
        {filteredEvents.map((event, index) => (
          <div 
            key={event.id} 
            className={`event-card animate-fade-in-up stagger-${(index % 4) + 1}`}
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "var(--glass-blur)",
              border: "1px solid var(--color-border-glass)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            <div style={{
              height: "160px",
              background: "linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(168, 85, 247, 0.1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4rem",
              position: "relative"
            }}>
              {event.image}
              <div style={{
                position: "absolute",
                bottom: "1rem",
                left: "1rem",
                background: "rgba(0,0,0,0.6)",
                padding: "0.25rem 0.75rem",
                borderRadius: "1rem",
                fontSize: "0.8rem",
                color: "white"
              }}>
                {event.category}
              </div>
            </div>
            
            <div style={{ padding: "1.5rem" }}>
              <div style={{ 
                color: "var(--color-accent-strong)", 
                fontWeight: 600, 
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                📅 {event.date}
              </div>
              <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.25rem" }}>{event.title}</h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                {event.description}
              </p>
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                paddingTop: "1rem",
                borderTop: "1px solid var(--color-border-glass)"
              }}>
                <span style={{ fontSize: "0.9rem", color: "var(--color-text-dim)" }}>
                  📍 {event.location}
                </span>
                <button className="btn-link" style={{ 
                  background: "transparent", 
                  color: "var(--color-accent)", 
                  border: "none", 
                  fontWeight: 600, 
                  cursor: "pointer" 
                }}>
                  Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
