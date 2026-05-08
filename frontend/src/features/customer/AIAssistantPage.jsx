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

      <div className="section-card bg-card border border-border rounded-xl p-6 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-600"></div>
        <div className="flex flex-col md:flex-row gap-4 mb-4 relative z-10">
          <input
            type="text"
            className="form-input flex-1 bg-background border-border focus:ring-primary focus:border-primary text-lg px-4 py-3 rounded-xl shadow-inner"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask: find top-rated dining with active discounts"
          />
          <button className="btn btn-primary px-8 py-3 rounded-xl text-lg font-bold shadow-md hover:shadow-lg transition-all" onClick={() => askConcierge()} disabled={loading}>
            {loading ? "Thinking..." : "✨ Ask AI"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 relative z-10">
          {QUICK_PROMPTS.map((prompt) => (
            <button key={prompt} className="btn btn-ghost btn-sm bg-secondary/50 hover:bg-primary/10 text-secondary-foreground border border-transparent hover:border-primary/20 rounded-lg px-3 py-1.5 transition-all" onClick={() => askConcierge(prompt)} disabled={loading}>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <>
          <div className="section-card bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
            <h2 className="section-title text-xl font-bold text-primary mb-2 flex items-center gap-2">✨ Concierge Summary</h2>
            <p className="text-foreground/90 font-medium leading-relaxed m-0">{result.message}</p>
          </div>

          <div className="section-card bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="section-title text-xl font-bold mb-4">Suggested Stores</h2>
            {result.stores?.length ? (
              <div className="store-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.stores.map((store) => (
                  <Link key={store.id} to={`/mall/stores/${store.id}`} className="store-card bg-background border border-border p-4 rounded-xl flex flex-col justify-between card-hover group text-foreground transition-all no-underline">
                    <div>
                        <div className="store-card-header mb-1">
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1 m-0">{store.name}</h3>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{store.category}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4 text-sm font-medium">
                      <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">★ {store.average_rating.toFixed(1)}</span>
                      <span className="text-muted-foreground bg-secondary px-2 py-1 rounded-md border border-border/50">👥 {store.current_footfall}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic mb-0">No store matches yet.</p>
            )}
          </div>

          <div className="section-card bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="section-title text-xl font-bold mb-4">Active Offers</h2>
            {result.offers?.length ? (
              <div className="booking-list grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.offers.map((offer) => (
                  <div key={offer.id} className="booking-item bg-background border border-border p-4 rounded-xl flex justify-between items-center card-hover group transition-all">
                    <div>
                      <div className="booking-title font-bold text-foreground group-hover:text-primary transition-colors">{offer.title}</div>
                      <div className="booking-time text-sm font-medium text-muted-foreground mt-1 bg-secondary/50 px-2 py-0.5 rounded inline-block border border-border/30">Store #{offer.store_id}</div>
                    </div>
                    <span className="booking-status text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-sm border border-primary/20">{offer.discount_percent}% OFF</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic mb-0">No offer matches yet.</p>
            )}
          </div>

          <div className="section-card bg-card border border-border rounded-xl p-6">
            <h2 className="section-title text-xl font-bold mb-4">Smart Tips</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2 m-0">
              {(result.tips ?? []).map((tip, idx) => (
                <li key={idx} className="leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
