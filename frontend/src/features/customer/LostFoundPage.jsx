import React, { useState } from "react";

export const LostFoundPage = () => {
    const [reportStatus, setReportStatus] = useState("idle");

    const handleSubmit = (e) => {
        e.preventDefault();
        setReportStatus("submitting");
        
        // Mock submission
        setTimeout(() => {
            setReportStatus("success");
        }, 1500);
    };

    return (
        <div className="customer-page animate-fade-in">
            <div className="page-header">
                <h1 className="hero-heading">Lost & Found</h1>
                <p className="hero-subtitle">Report a lost item or check found items list.</p>
            </div>

            <div className="card-grid" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                marginTop: "2rem"
            }}>
                <div style={{
                    gridColumn: "span 2",
                    background: "rgba(239, 68, 68, 0.05)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "var(--radius-xl)",
                    padding: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem"
                }}>
                    <span style={{ fontSize: "2rem" }}>💡</span>
                    <div>
                        <h3 style={{ margin: "0 0 0.25rem", color: "var(--color-danger)" }}>Important Notice</h3>
                        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
                            Found items are kept securely at the Main Security Desk (Ground Floor) for 30 days.
                        </p>
                    </div>
                </div>

                <div className="report-form-container" style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--color-border-glass)",
                    borderRadius: "var(--radius-xl)",
                    padding: "2rem"
                }}>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Report Lost Item</h2>
                    
                    {reportStatus === "success" ? (
                        <div className="success-message" style={{ textAlign: "center", padding: "2rem" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                            <h3 style={{ color: "var(--color-success)" }}>Report Submitted!</h3>
                            <p>Our security team will contact you if a match is found.</p>
                            <button 
                                onClick={() => setReportStatus("idle")}
                                className="btn btn-secondary"
                                style={{ marginTop: "1rem" }}
                            >
                                Report Another Item
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Item Description</label>
                                <textarea 
                                    className="form-input" 
                                    rows="3" 
                                    placeholder="e.g. Blue leather wallet, brands..." 
                                    required 
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)" }}
                                />
                            </div>
                            <div>
                                <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Where was it last seen?</label>
                                <select className="form-select" style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                                    <option>Select Location...</option>
                                    <option>Food Court</option>
                                    <option>Parking Lot</option>
                                    <option>Restrooms</option>
                                    <option>Store (Specify in description)</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Contact Phone</label>
                                <input 
                                    type="tel" 
                                    className="form-input" 
                                    placeholder="+1 (555) 000-0000" 
                                    required 
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)" }}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={reportStatus === "submitting"}
                                style={{ marginTop: "1rem", padding: "0.75rem" }}
                            >
                                {reportStatus === "submitting" ? "Submitting..." : "Submit Report"}
                            </button>
                        </form>
                    )}
                </div>

                <div className="recent-found-items" style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--color-border-glass)",
                    borderRadius: "var(--radius-xl)",
                    padding: "2rem"
                }}>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Recently Found Items</h2>
                    <div className="found-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {[
                            { item: "Black Umbrella", location: "Entrance A", date: "Today" },
                            { item: "Keys with Red Keychain", location: "Parking Level 2", date: "Yesterday" },
                            { item: "Child's Toy (Teddy Bear)", location: "Cinema Lobby", date: "2 days ago" },
                        ].map((found, idx) => (
                            <div key={idx} className="found-item" style={{
                                padding: "1rem",
                                background: "rgba(255, 255, 255, 0.03)",
                                borderRadius: "var(--radius-lg)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{found.item}</div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-dim)" }}>Found at: {found.location}</div>
                                </div>
                                <span className="badge" style={{ 
                                    fontSize: "0.75rem", 
                                    background: "var(--color-accent-soft)",
                                    color: "var(--color-accent)",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "1rem"
                                }}>
                                    {found.date}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                        Is one of these yours? <a href="#" style={{ color: "var(--color-accent)" }}>Claim it now</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
