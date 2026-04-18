import React, { useEffect, useMemo, useState } from "react";
import { moviesApi } from "@/services/api/movies";

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
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await moviesApi.listBookings();
        setBookings(res.data.bookings ?? []);
      } catch {
        setMessage("Could not load bookings right now.");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const upcomingCount = useMemo(
    () => bookings.filter((booking) => booking.booking_status === "booked").length,
    [bookings]
  );

  const toggleShowtime = (movieId, time) => {
    setSelectedByMovie((prev) => ({
      ...prev,
      [movieId]: prev[movieId] === time ? null : time,
    }));
  };

  const bookTicket = async (movie) => {
    const selectedTime = selectedByMovie[movie.id];
    if (!selectedTime) {
      return;
    }

    try {
      const res = await moviesApi.createBooking({
        movie_id: movie.id,
        movie_title: movie.title,
        showtime: selectedTime,
      });
      const booking = res.data.booking;
      setBookings((prev) => [booking, ...prev.filter((item) => item.id !== booking.id)].slice(0, 8));
      setSelectedByMovie((prev) => ({
        ...prev,
        [movie.id]: null,
      }));
      setMessage("Ticket booked successfully.");
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "Failed to create booking.");
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await moviesApi.cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, booking_status: "cancelled" } : booking
        )
      );
      setMessage("Booking cancelled.");
    } catch (err) {
      setMessage(err.response?.data?.detail ?? "Failed to cancel booking.");
    }
  };

  return (
    <div className="customer-page animate-fade-in text-lg">
      <div className="page-header">
        <h1 className="hero-heading text-5xl font-extrabold mb-4">Cinema Showtimes</h1>
        <p className="hero-subtitle text-2xl">Catch the latest blockbusters at SmartMall Cinema 4K.</p>
      </div>

      {message && <div className="message-banner text-xl font-semibold" style={{ marginBottom: "1rem" }}>{message}</div>}

      <div className="cinema-info animate-fade-in-up">
        <div>
          <div className="cinema-info-title text-3xl font-bold">
            Now Showing
          </div>
          <div className="cinema-info-subtitle text-xl mt-2">
            Today's Schedule • All halls equipped with Dolby Atmos
          </div>
        </div>
        <div className="feature-kpi text-center">
          <span className="feature-kpi-value text-4xl font-black">{upcomingCount}</span>
          <span className="text-xl font-medium block mt-1">Upcoming bookings</span>
        </div>
      </div>

      <div className="movies-grid mt-8">
        {MOVIES.map((movie, index) => (
          <div 
            key={movie.id} 
            className={`movie-card animate-fade-in-up stagger-${(index % 4) + 1}`}
          >
            <div className="movie-poster text-8xl py-10">
              {movie.poster}
              <div className="movie-rating-pill text-xl font-bold px-4 py-2 mt-4 inline-block bg-gray-200 dark:bg-gray-800 rounded-full">
                {movie.rating}
              </div>
            </div>
            
            <div className="movie-details p-6">
              <h3 className="movie-title text-3xl font-bold mb-4">{movie.title}</h3>
              <div className="movie-meta-row flex gap-6 text-xl text-gray-600 dark:text-gray-300 mb-6">
                <span>⏱️ {movie.duration}</span>
                <span>🎬 {movie.genre}</span>
              </div>
              
              <div className="movie-showtimes-wrap mb-6">
                <div className="movie-showtimes-title text-2xl font-semibold mb-4">Showtimes:</div>
                <div className="movie-showtimes-list flex flex-wrap gap-3">
                  {movie.showtimes.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={`movie-time-btn text-xl font-medium px-4 py-2 rounded-md transition-colors ${selectedByMovie[movie.id] === time ? "active bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"}`}
                      onClick={() => toggleShowtime(movie.id, time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary movie-book-btn w-full text-2xl font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => bookTicket(movie)}
                disabled={!selectedByMovie[movie.id]}
              >
                {selectedByMovie[movie.id] ? `Book ${selectedByMovie[movie.id]}` : "Select a showtime"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="panel animate-fade-in-up" style={{ marginTop: "3rem", padding: "2rem" }}>
        <h2 className="panel-title text-4xl font-bold mb-6">Your Recent Bookings</h2>
        {loading ? (
          <p className="hero-subtitle text-2xl" style={{ marginBottom: 0 }}>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="hero-subtitle text-2xl" style={{ marginBottom: 0 }}>No bookings yet. Pick a showtime above to reserve your ticket.</p>
        ) : (
          <div className="booking-list mt-6 flex flex-col gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-item p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center shadow-sm">
                <div>
                  <div className="booking-title text-2xl font-bold">{booking.movie_title}</div>
                  <div className="booking-time text-xl text-gray-500 mt-1">{booking.showtime}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span className={`booking-status text-xl font-semibold uppercase px-3 py-1 rounded ${booking.booking_status === "cancelled" ? "cancelled text-red-600 bg-red-100" : "text-green-600 bg-green-100"}`}>
                    {booking.booking_status}
                  </span>
                  {booking.booking_status === "booked" && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-xl font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded"
                      onClick={() => cancelBooking(booking.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
