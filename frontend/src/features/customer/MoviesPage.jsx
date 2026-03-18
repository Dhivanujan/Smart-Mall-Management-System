import React from "react";

const MOVIES = [
  {
    id: 1,
    title: "Space Odyssey 2050",
    genre: "Sci-Fi",
    duration: "2h 15m",
    rating: "PG-13",
    showtimes: ["10:30 AM", "1:15 PM", "4:00 PM", "7:45 PM"],
    poster: "🚀"
  },
  {
    id: 2,
    title: "Love inside the Mall",
    genre: "Romance",
    duration: "1h 50m",
    rating: "R",
    showtimes: ["12:00 PM", "2:30 PM", "5:00 PM"],
    poster: "💑"
  },
  {
    id: 3,
    title: "The Silent Forest",
    genre: "Thriller",
    duration: "2h 5m",
    rating: "R",
    showtimes: ["6:00 PM", "8:45 PM", "11:00 PM"],
    poster: "🌲"
  },
  {
    id: 4,
    title: "Super Hamster 3",
    genre: "Animation",
    duration: "1h 35m",
    rating: "G",
    showtimes: ["10:00 AM", "12:15 PM", "2:30 PM", "4:45 PM"],
    poster: "🐹"
  },
];

export const MoviesPage = () => {
  return (
    <div className="customer-page animate-fade-in">
      <div className="page-header">
        <h1 className="hero-heading">Cinema Showtimes</h1>
        <p className="hero-subtitle">Catch the latest blockbusters at SmartMall Cinema 4K.</p>
      </div>

      <div className="cinema-info animate-fade-in-up" style={{
        margin: "0 0 2rem",
        padding: "1.5rem",
        background: "linear-gradient(to right, rgba(168, 85, 247, 0.1), rgba(6, 182, 212, 0.05))",
        borderRadius: "var(--radius-xl)",
        border: "1px solid rgba(168, 85, 247, 0.2)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        justifyContent: "space-between"
      }}> 
        <div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
            Now Showing
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
            Today's Schedule • All halls equipped with Dolby Atmos
          </div>
        </div>
        <button className="btn btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
          Buy Tickets Online
        </button>
      </div>

      <div className="movies-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "2rem"
      }}>
        {MOVIES.map((movie, index) => (
          <div 
            key={movie.id} 
            className={`movie-card animate-fade-in-up stagger-${(index % 4) + 1}`}
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "var(--glass-blur)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--color-border-glass)",
              display: "flex",
              flexDirection: "column",
              height: "100%"
            }}
          >
            <div className="movie-poster" style={{
              height: "200px",
              background: "linear-gradient(to bottom, #1e1b4b, #312e81)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "5rem",
              position: "relative"
            }}>
              {movie.poster}
              <div style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: 600
              }}>
                {movie.rating}
              </div>
            </div>
            
            <div className="movie-details" style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem" }}>{movie.title}</h3>
              <div style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--color-text-dim)", display: "flex", gap: "1rem" }}>
                <span>⏱️ {movie.duration}</span>
                <span>🎬 {movie.genre}</span>
              </div>
              
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>Showtimes:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {movie.showtimes.map(time => (
                    <button key={time} className="btn-time" style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "0.5rem",
                      padding: "0.35rem 0.65rem",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      color: "var(--color-text-primary)",
                      transition: "all 0.2s"
                    }}>
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
