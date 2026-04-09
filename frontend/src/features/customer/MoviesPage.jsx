import React, { useEffect, useMemo, useState } from "react";

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
  const [selectedByMovie, setSelectedByMovie] = useState({});
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("smartmall.movies.bookings");
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setBookings(parsed);
      }
    } catch {
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("smartmall.movies.bookings", JSON.stringify(bookings));
  }, [bookings]);

  const upcomingCount = useMemo(
    () => bookings.filter((booking) => booking.status === "Booked").length,
    [bookings]
  );

  const toggleShowtime = (movieId, time) => {
    setSelectedByMovie((prev) => ({
      ...prev,
      [movieId]: prev[movieId] === time ? null : time,
    }));
  };

  const bookTicket = (movie) => {
    const selectedTime = selectedByMovie[movie.id];
    if (!selectedTime) {
      return;
    }

    const booking = {
      id: `${movie.id}-${Date.now()}`,
      movieId: movie.id,
      title: movie.title,
      time: selectedTime,
      status: "Booked",
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [booking, ...prev].slice(0, 6));
    setSelectedByMovie((prev) => ({
      ...prev,
      [movie.id]: null,
    }));
  };

  return (
    <div className="customer-page animate-fade-in">
      <div className="page-header">
        <h1 className="hero-heading">Cinema Showtimes</h1>
        <p className="hero-subtitle">Catch the latest blockbusters at SmartMall Cinema 4K.</p>
      </div>

      <div className="cinema-info animate-fade-in-up">
        <div>
          <div className="cinema-info-title">
            Now Showing
          </div>
          <div className="cinema-info-subtitle">
            Today's Schedule • All halls equipped with Dolby Atmos
          </div>
        </div>
        <div className="feature-kpi">
          <span className="feature-kpi-value">{upcomingCount}</span>
          <span>Upcoming bookings</span>
        </div>
      </div>

      <div className="movies-grid">
        {MOVIES.map((movie, index) => (
          <div 
            key={movie.id} 
            className={`movie-card animate-fade-in-up stagger-${(index % 4) + 1}`}
          >
            <div className="movie-poster">
              {movie.poster}
              <div className="movie-rating-pill">
                {movie.rating}
              </div>
            </div>
            
            <div className="movie-details">
              <h3 className="movie-title">{movie.title}</h3>
              <div className="movie-meta-row">
                <span>⏱️ {movie.duration}</span>
                <span>🎬 {movie.genre}</span>
              </div>
              
              <div className="movie-showtimes-wrap">
                <div className="movie-showtimes-title">Showtimes:</div>
                <div className="movie-showtimes-list">
                  {movie.showtimes.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={`movie-time-btn ${selectedByMovie[movie.id] === time ? "active" : ""}`}
                      onClick={() => toggleShowtime(movie.id, time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary movie-book-btn"
                onClick={() => bookTicket(movie)}
                disabled={!selectedByMovie[movie.id]}
              >
                {selectedByMovie[movie.id] ? `Book ${selectedByMovie[movie.id]}` : "Select a showtime"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="panel animate-fade-in-up" style={{ marginTop: "2rem" }}>
        <h2 className="panel-title">Your Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p className="hero-subtitle" style={{ marginBottom: 0 }}>No bookings yet. Pick a showtime above to reserve your ticket.</p>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-item">
                <div>
                  <div className="booking-title">{booking.title}</div>
                  <div className="booking-time">{booking.time}</div>
                </div>
                <span className="booking-status">{booking.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
