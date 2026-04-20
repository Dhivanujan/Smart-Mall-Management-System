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
    <div className="animate-fade-in text-base bg-background min-h-screen text-foreground">
      <div className="mb-10 flex flex-col items-center text-center">
        <h1 className="text-5xl font-black tracking-tight text-primary mb-4 block">Cinema Showtimes</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">Catch the latest blockbusters at SmartMall Cinema 4K. Experience the magic of the movies.</p>
      </div>

      {message && <div className="text-lg font-medium bg-primary/10 text-primary border border-primary/20 p-4 rounded-xl shadow-sm text-center mb-8">{message}</div>}

      <div className="animate-fade-in-up bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between shadow-xl">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <div className="text-3xl font-extrabold mb-2">
            Now Showing
          </div>
          <div className="text-primary-foreground/80 font-medium">
            Today's Schedule • All halls equipped with Dolby Atmos & IMAX
          </div>
        </div>
        <div className="text-center bg-background/10 backdrop-blur-md rounded-xl p-6 min-w-[200px] border border-primary-foreground/10">
          <span className="text-5xl font-black block">{upcomingCount}</span>
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70 mt-2 block">Your Bookings</span>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {MOVIES.map((movie, index) => (
          <div 
            key={movie.id} 
            className={`animate-fade-in-up stagger-${(index % 4) + 1} bg-card text-card-foreground rounded-2xl shadow-md border border-border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
          >
            <div className="flex flex-col items-center justify-center text-8xl py-12 bg-secondary/50 border-b border-border">
              {movie.poster}
              <div className="text-sm font-bold px-4 py-1.5 mt-6 inline-block bg-background text-foreground rounded-full shadow-sm border border-border">
                {movie.rating}
              </div>
            </div>
            
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-3 line-clamp-1">{movie.title}</h3>
              <div className="flex gap-4 text-base text-muted-foreground mb-6 font-medium">
                <span>⏱️ {movie.duration}</span>
                <span>🎬 {movie.genre}</span>
              </div>
              
              <div className="mb-8">
                <div className="text-lg font-semibold mb-3">Showtimes</div>
                <div className="flex flex-wrap gap-2">
                  {movie.showtimes.map(time => (
                    <button
                      key={time}
                      type="button"
                      className={`text-xl font-medium px-4 py-2 rounded-md transition-colors ${selectedByMovie[movie.id] === time ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2" : "bg-secondary text-secondary-foreground hover:bg-primary/20"}`}
                      onClick={() => toggleShowtime(movie.id, time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="bg-primary text-primary-foreground w-full text-2xl font-bold py-4 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                onClick={() => bookTicket(movie)}
                disabled={!selectedByMovie[movie.id]}
              >
                {selectedByMovie[movie.id] ? `Book ${selectedByMovie[movie.id]}` : "Select a showtime"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="animate-fade-in-up bg-card text-card-foreground shadow-lg rounded-2xl border border-border" style={{ marginTop: "4rem", padding: "2.5rem" }}>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <span className="text-primary">🎟️</span> Your Recent Bookings
        </h2>
        {loading ? (
          <p className="text-muted-foreground text-lg animate-pulse" style={{ marginBottom: 0 }}>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-muted-foreground text-lg bg-secondary/50 p-6 rounded-xl border border-dashed border-border" style={{ marginBottom: 0 }}>No bookings yet. Pick a showtime above to reserve your ticket.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-5 bg-background border border-border rounded-xl flex justify-between items-center shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                <div>
                  <div className="text-xl font-bold text-foreground">{booking.movie_title}</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                    <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{booking.showtime}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full tracking-wider ${booking.booking_status === "cancelled" ? "text-destructive bg-destructive/10 border border-destructive/20" : "text-green-700 bg-green-100 border border-green-200 dark:bg-green-900/30 dark:text-green-400"}`}>
                    {booking.booking_status}
                  </span>
                  {booking.booking_status === "booked" && (
                    <button
                      type="button"
                      className="text-sm font-bold text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
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
