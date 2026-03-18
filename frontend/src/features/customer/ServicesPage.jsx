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
    <div className="customer-page animate-fade-in">
      <div className="page-header">
        <h1 className="hero-heading">Mall Services</h1>
        <p className="hero-subtitle">Amenities designed for your comfort and convenience</p>
      </div>

      <div className="services-grid">
        {SERVICES.map((service, index) => (
          <div 
            key={service.title} 
            className={`service-card animate-fade-in-up stagger-${(index % 6) + 1}`}
          >
            <div className="service-icon">{service.icon}</div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-desc">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="emergency-contact-box animate-fade-in-up stagger-6">
        <div className="emergency-icon">🚨</div>
        <div className="emergency-content">
          <h3 className="emergency-title">Emergency Contacts</h3>
          <p className="emergency-text">
            For immediate assistance, please contact our 24/7 security team.
          </p>
        </div>
        <div className="emergency-actions">
          <a href="tel:555-0123" className="btn-emergency btn-emergency-primary">
            📞 Security: 555-0123
          </a>
          <a href="tel:555-0911" className="btn-emergency btn-emergency-secondary">
            🏥 Medical: 555-0911
          </a>
        </div>
      </div>
    </div>
  );
};
