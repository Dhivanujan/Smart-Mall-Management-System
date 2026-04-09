import React, { useState } from "react";

const INITIAL_FORM = {
    itemDescription: "",
    location: "",
    phone: "",
    details: "",
};

const FOUND_ITEMS = [
    { id: "f1", item: "Black Umbrella", location: "Entrance A", date: "Today" },
    { id: "f2", item: "Keys with Red Keychain", location: "Parking Level 2", date: "Yesterday" },
    { id: "f3", item: "Child's Toy (Teddy Bear)", location: "Cinema Lobby", date: "2 days ago" },
];

export const LostFoundPage = () => {
    const [reportStatus, setReportStatus] = useState("idle");
    const [form, setForm] = useState(INITIAL_FORM);
    const [reports, setReports] = useState(() => {
        const raw = localStorage.getItem("smartmall.lostfound.reports");
        if (!raw) {
            return [];
        }

        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.itemDescription.trim() || !form.location.trim() || !form.phone.trim()) {
            setReportStatus("error");
            return;
        }

        setReportStatus("submitting");
        
        setTimeout(() => {
            const createdReport = {
                id: Date.now().toString(),
                itemDescription: form.itemDescription.trim(),
                location: form.location.trim(),
                phone: form.phone.trim(),
                details: form.details.trim(),
                status: "Open",
                createdAt: new Date().toISOString(),
            };

            const updatedReports = [createdReport, ...reports].slice(0, 8);
            setReports(updatedReports);
            localStorage.setItem("smartmall.lostfound.reports", JSON.stringify(updatedReports));
            setForm(INITIAL_FORM);
            setReportStatus("success");
        }, 1500);
    };

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (reportStatus === "error") {
            setReportStatus("idle");
        }
    };

    return (
        <div className="customer-page animate-fade-in">
            <div className="page-header">
                <h1 className="hero-heading">Lost & Found</h1>
                <p className="hero-subtitle">Report a lost item or check found items list.</p>
            </div>

            <div className="lostfound-grid">
                <div className="lostfound-notice">
                    <span className="lostfound-notice-icon">💡</span>
                    <div>
                        <h3 className="lostfound-notice-title">Important Notice</h3>
                        <p className="lostfound-notice-copy">
                            Found items are kept securely at the Main Security Desk (Ground Floor) for 30 days.
                        </p>
                    </div>
                </div>

                <div className="report-form-container">
                    <h2 className="lostfound-section-title">Report Lost Item</h2>
                    
                    {reportStatus === "success" ? (
                        <div className="success-message">
                            <div className="lostfound-success-icon">✅</div>
                            <h3 className="lostfound-success-title">Report Submitted!</h3>
                            <p className="lostfound-success-copy">Our security team will contact you if a match is found.</p>
                            <button 
                                onClick={() => setReportStatus("idle")}
                                className="btn btn-secondary"
                            >
                                Report Another Item
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="lostfound-form">
                            <div>
                                <label className="form-label">Item Description</label>
                                <textarea 
                                    className="form-input" 
                                    rows="3" 
                                    placeholder="e.g. Blue leather wallet, brands..." 
                                    required 
                                    value={form.itemDescription}
                                    onChange={(e) => updateField("itemDescription", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="form-label">Where was it last seen?</label>
                                <select
                                    className="form-select"
                                    required
                                    value={form.location}
                                    onChange={(e) => updateField("location", e.target.value)}
                                >
                                    <option value="">Select location...</option>
                                    <option value="Food Court">Food Court</option>
                                    <option value="Parking Lot">Parking Lot</option>
                                    <option value="Restrooms">Restrooms</option>
                                    <option value="Store">Store</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Contact Phone</label>
                                <input 
                                    type="tel" 
                                    className="form-input" 
                                    placeholder="+1 (555) 000-0000" 
                                    required 
                                    value={form.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="form-label">Additional Details (optional)</label>
                                <textarea
                                    className="form-input"
                                    rows="2"
                                    value={form.details}
                                    onChange={(e) => updateField("details", e.target.value)}
                                    placeholder="Color, brand, serial numbers, or other useful details"
                                />
                            </div>
                            {reportStatus === "error" && (
                                <div className="message-banner" style={{ borderColor: "rgba(239, 68, 68, 0.3)", color: "#fecaca" }}>
                                    Please fill all required fields before submitting.
                                </div>
                            )}
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={reportStatus === "submitting"}
                            >
                                {reportStatus === "submitting" ? "Submitting..." : "Submit Report"}
                            </button>
                        </form>
                    )}
                </div>

                <div className="recent-found-items">
                    <h2 className="lostfound-section-title">Recently Found Items</h2>
                    <div className="found-list">
                        {FOUND_ITEMS.map((found) => (
                            <div key={found.id} className="found-item">
                                <div>
                                    <div className="found-item-name">{found.item}</div>
                                    <div className="found-item-location">Found at: {found.location}</div>
                                </div>
                                <span className="badge found-item-date">
                                    {found.date}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="found-item-cta">
                        Is one of these yours? <a href="#" style={{ color: "var(--color-accent)" }}>Claim it now</a>
                    </div>
                </div>

                <div className="panel" style={{ gridColumn: "1 / -1" }}>
                    <h2 className="panel-title">Your Submitted Reports</h2>
                    {reports.length === 0 ? (
                        <p className="hero-subtitle" style={{ marginBottom: 0 }}>No reports submitted yet.</p>
                    ) : (
                        <div className="booking-list">
                            {reports.map((report) => (
                                <div key={report.id} className="booking-item">
                                    <div>
                                        <div className="booking-title">{report.itemDescription}</div>
                                        <div className="booking-time">Last seen at {report.location}</div>
                                    </div>
                                    <span className="booking-status">{report.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
