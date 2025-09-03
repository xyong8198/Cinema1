
"use client";
import React, { useEffect, useState } from "react";

export default function HallReservationsList() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  fetch("http://localhost:8080/hall-reservation/reservations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reservations");
        return res.json();
      })
      .then(setReservations)
      .catch(() => setError("Failed to load reservations"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>All Hall Reservations</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : reservations.length === 0 ? (
        <p>No reservations found.</p>
      ) : (
        <ul>
          {reservations.map((r, i) => (
            <li key={i}>
              Hall: <b>{r.hallName}</b> | Time: <b>{r.time}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
