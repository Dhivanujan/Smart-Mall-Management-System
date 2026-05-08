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
            className={`service-card animate-fade-in-up stagger-${(index % 6) + 1} card-hover group bg-card border border-border rounded-xl p-6 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="service-icon text-4xl mb-4 group-hover:scale-110 transition-transform origin-bottom-left drop-shadow-sm">{service.icon}</div>
            <h3 className="service-title text-xl font-bold text-foreground mb-2 relative z-10">{service.title}</h3>
            <p className="service-desc text-muted-foreground leading-relaxed relative z-10">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="emergency-contact-box animate-fade-in-up stagger-6 mt-12 bg-destructive/5 border border-destructive/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="emergency-icon text-6xl drop-shadow-md animate-pulse">🚨</div>
        <div className="emergency-content flex-1 text-center md:text-left relative z-10">
          <h3 className="emergency-title text-2xl font-black text-destructive mb-2">Emergency Contacts</h3>
          <p className="emergency-text text-foreground/80 font-medium text-lg">
            For immediate assistance, please contact our 24/7 security team.
          </p>
        </div>
        <div className="emergency-actions flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
          <a href="tel:555-0123" className="btn-emergency btn-emergency-primary flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold px-6 py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 whitespace-nowrap text-center">
            📞 Security: 555-0123
          </a>
          <a href="tel:555-0911" className="btn-emergency btn-emergency-secondary flex-1 bg-background hover:bg-muted text-foreground border border-border font-bold px-6 py-3 rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 whitespace-nowrap text-center">
            🏥 Medical: 555-0911
          </a>
        </div>
      </div>
    </div>
  );
};
