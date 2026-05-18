import React, { useEffect, useState } from "react";
import { lostFoundApi } from "@/services/api/lostFound";

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
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadReports = async () => {
            try {
                const res = await lostFoundApi.listMyReports();
                setReports(res.data.reports ?? []);
            } catch {
                setMessage("Could not load your reports right now.");
            } finally {
                setLoadingReports(false);
            }
        };

        loadReports();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.itemDescription.trim() || !form.location.trim() || !form.phone.trim()) {
            setReportStatus("error");
            return;
        }

        setReportStatus("submitting");
        
        lostFoundApi.createReport({
            item_description: form.itemDescription.trim(),
            last_seen_location: form.location.trim(),
            contact_phone: form.phone.trim(),
            additional_details: form.details.trim() || null,
        }).then((res) => {
            const createdReport = res.data.report;
            setReports((prev) => [createdReport, ...prev].slice(0, 8));
            setForm(INITIAL_FORM);
            setReportStatus("success");
            setMessage("Report submitted successfully.");
        }).catch((err) => {
            setReportStatus("error");
            setMessage(err.response?.data?.detail ?? "Failed to submit report.");
        });
    };

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (reportStatus === "error") {
            setReportStatus("idle");
        }
        if (message) {
            setMessage("");
        }
    };

    return (
        <div className="customer-page animate-fade-in">
            <div className="page-header">
                <h1 className="hero-heading">Lost & Found</h1>
                <p className="hero-subtitle">Report a lost item or check found items list.</p>
            </div>

            {message && <div className="message-banner" style={{ marginBottom: "1rem" }}>{message}</div>}

            <div className="lostfound-grid">
                <div className="lostfound-notice bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl flex items-start gap-4 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <span className="lostfound-notice-icon text-3xl drop-shadow-sm relative z-10">💡</span>
                    <div className="relative z-10">
                        <h3 className="lostfound-notice-title text-blue-600 dark:text-blue-400 font-bold text-lg mb-1">Important Notice</h3>
                        <p className="lostfound-notice-copy text-blue-600/80 dark:text-blue-400/80 font-medium">
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
                    <div className="found-list flex flex-col gap-3 mt-4">
                        {FOUND_ITEMS.map((found) => (
                            <div key={found.id} className="found-item bg-card border border-border p-4 rounded-xl flex justify-between items-center card-hover group transition-all">
                                <div>
                                    <div className="found-item-name font-bold text-foreground group-hover:text-primary transition-colors">{found.item}</div>
                                    <div className="found-item-location text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1"><span className="text-primary/70">📍</span> Found at: {found.location}</div>
                                </div>
                                <span className="badge found-item-date bg-secondary px-3 py-1 rounded-md text-xs font-bold text-secondary-foreground uppercase tracking-wider border border-border/50">
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
                    {loadingReports ? (
                        <p className="hero-subtitle" style={{ marginBottom: 0 }}>Loading reports...</p>
                    ) : reports.length === 0 ? (
                        <p className="hero-subtitle" style={{ marginBottom: 0 }}>No reports submitted yet.</p>
                    ) : (
                        <div className="booking-list grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {reports.map((report) => (
                                <div key={report.id} className="booking-item p-5 bg-card border border-border rounded-xl flex justify-between items-center shadow-sm card-hover transition-all group">
                                    <div>
                                        <div className="booking-title text-lg font-bold text-foreground group-hover:text-primary transition-colors">{report.item_description}</div>
                                        <div className="booking-time text-sm font-medium text-muted-foreground mt-2 bg-secondary/50 px-2 py-1 rounded inline-block border border-border/30">Last seen at {report.last_seen_location}</div>
                                    </div>
                                    <span className={`booking-status text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${report.status === 'open' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-secondary text-secondary-foreground border border-border/50'}`}>{report.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
