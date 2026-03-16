import React from "react";

const SERVICES = [
  {
    icon: "🛗",
    title: "Elevators & Escalators",
    description: "Located near all main entrances and at the center atrium for easy access to all floors.",
  },
  {
    icon: "🚻",
    title: "Restrooms",
    description: "Clean and accessible restrooms available on every floor near the elevators.",
  },
  {
    icon: "♿",
    title: "Wheelchair Assistance",
    description: "Complimentary wheelchairs available at the Information Desk on the Ground Floor.",
  },
  {
    icon: "🅿️",
    title: "Smart Parking",
    description: "Ample parking space with real-time availability tracking and dedicated zones for families.",
  },
  {
    icon: "📶",
    title: "Free Wi-Fi",
    description: "Stay connected with high-speed internet throughout the mall. Network: SmartMall_Guest",
  },
  {
    icon: "🏧",
    title: "ATMs & Banking",
    description: "Multiple bank ATMs located on the Ground Floor and Level 2 near the food court.",
  },
  {
    icon: "🧸",
    title: "Kids Play Area",
    description: "Safe and fun play zone for children located on Level 3 near the cinema.",
  },
  {
    icon: "🚑",
    title: "First Aid",
    description: "Medical assistance available 24/7. Contact security or visit the infirmary on Level 1.",
  },
];

export const ServicesPage = () => {
  return (
    <div className="customer-page">
      <div className="page-header">
        <h1 className="hero-heading">Mall Services</h1>
        <p className="hero-subtitle">Amenities designed for your comfort and convenience</p>
      </div>

      <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {SERVICES.map((service) => (
          <div key={service.title} className="service-card animate-fade-in-up" style={{
            background: "var(--glass-bg)",
            backdropFilter: "var(--glass-blur)",
            border: "1px solid var(--color-border-glass)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            boxShadow: "var(--shadow-card)",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>{service.icon}</div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>{service.title}</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
              {service.description}
            </p>
          </div>
        ))}
      </div>

      <div className="emergency-contact" style={{ marginTop: "3rem", padding: "2rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-xl)", border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ fontSize: "2.5rem" }}>🚨</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", color: "#fca5a5" }}>Emergency Contacts</h3>
          <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
            For immediate assistance, please contact our 24/7 security team.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <a href="tel:555-0123" className="btn" style={{ background: "#ef4444", color: "white", border: "none" }}>
            📞 Security: 555-0123
          </a>
          <a href="tel:555-0911" className="btn" style={{ background: "transparent", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)" }}>
            🏥 Medical: 555-0911
          </a>
        </div>
      </div>
    </div>
  );
};
