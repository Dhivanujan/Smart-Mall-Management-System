import React, { useState } from "react";
import { Link } from "react-router-dom";
import { discoveryApi } from "@/services/api/discovery";

const QUICK_PROMPTS = [
  "Family shopping plan for 2 hours",
  "Best dining offers today",
  "High-rated electronics stores",
  "Low-crowd fashion stores now",
];

export const AIAssistantPage = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const askConcierge = async (nextQuery) => {
    const finalQuery = (nextQuery ?? query).trim();
    if (!finalQuery) {
      setMessage("Please enter a request.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await discoveryApi.concierge(finalQuery);
      setResult(res.data);
      setQuery(finalQuery);
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "AI concierge is unavailable right now.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-page animate-fade-in">
      <div className="page-header">
        <h1 className="hero-heading">AI Mall Concierge</h1>
        <p className="hero-subtitle">Ask for plans, offers, and smart recommendations in natural language.</p>
      </div>

      {message && <div className="message-banner" style={{ marginBottom: "1rem" }}>{message}</div>}

      <div className="section-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask: find top-rated dining with active discounts"
            style={{ flex: 1, minWidth: "260px" }}
          />
          <button className="btn btn-primary" onClick={() => askConcierge()} disabled={loading}>
            {loading ? "Thinking..." : "Ask Concierge"}
          </button>
        </div>
        <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map((prompt) => (
            <button key={prompt} className="btn btn-ghost btn-sm" onClick={() => askConcierge(prompt)} disabled={loading}>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <>
          <div className="section-card" style={{ marginBottom: "1rem" }}>
            <h2 className="section-title" style={{ marginBottom: "0.35rem" }}>Concierge Summary</h2>
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>{result.message}</p>
          </div>

          <div className="section-card" style={{ marginBottom: "1rem" }}>
            <h2 className="section-title">Suggested Stores</h2>
            {result.stores?.length ? (
              <div className="store-grid">
                {result.stores.map((store) => (
                  <Link key={store.id} to={`/mall/stores/${store.id}`} className="store-card" style={{ textDecoration: "none" }}>
                    <div className="store-card-header">
                      <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{store.name}</h3>
                    </div>
                    <span style={{ color: "var(--color-text-dim)", fontSize: "0.8rem" }}>{store.category}</span>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.65rem", fontSize: "0.84rem" }}>
                      <span style={{ color: "#fbbf24" }}>★ {store.average_rating.toFixed(1)}</span>
                      <span style={{ color: "var(--color-text-muted)" }}>👥 {store.current_footfall}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="hero-subtitle" style={{ marginBottom: 0 }}>No store matches yet.</p>
            )}
          </div>

          <div className="section-card" style={{ marginBottom: "1rem" }}>
            <h2 className="section-title">Active Offers</h2>
            {result.offers?.length ? (
              <div className="booking-list">
                {result.offers.map((offer) => (
                  <div key={offer.id} className="booking-item">
                    <div>
                      <div className="booking-title">{offer.title}</div>
                      <div className="booking-time">Store #{offer.store_id}</div>
                    </div>
                    <span className="booking-status">{offer.discount_percent}% OFF</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="hero-subtitle" style={{ marginBottom: 0 }}>No offer matches yet.</p>
            )}
          </div>

          <div className="section-card">
            <h2 className="section-title">Smart Tips</h2>
            <ul style={{ margin: 0, paddingLeft: "1rem", color: "var(--color-text-muted)" }}>
              {(result.tips ?? []).map((tip, idx) => (
                <li key={idx} style={{ marginBottom: "0.35rem" }}>{tip}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
