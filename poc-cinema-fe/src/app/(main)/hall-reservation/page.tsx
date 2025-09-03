// src/app/(main)/hall-reservation/page.tsx

'use client';
import React, { useEffect, useState } from 'react';
import { fetchAvailableHalls, reserveHall, fetchAllReservations } from '../../../lib/hallReservationApi';
import { useAuth } from '../../../contexts/AuthContext';

export default function HallReservationPage() {
  const [halls, setHalls] = useState<{ hallName: string; time: string }[]>([]);
  const [selectedHall, setSelectedHall] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth?.() || { user: null };

  useEffect(() => {
    fetchAvailableHalls().then(setHalls).catch(() => setMessage("Failed to load halls"));
  }, []);

  const handleReserve = async () => {
    if (!selectedHall || !selectedTime || !user?.username) return;
    setLoading(true);
    setMessage("");
    try {
      await reserveHall({ hallName: selectedHall, time: selectedTime, username: user.username });
      setMessage("Reservation successful!");
      setSelectedHall('');
      setSelectedTime('');
    } catch {
      setMessage("Reservation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1>Hall Reservation</h1>
      <h2>Available Halls</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select
          value={selectedHall}
          onChange={e => {
            setSelectedHall(e.target.value);
            setSelectedTime('');
          }}
          style={{ flex: 1, padding: 8 }}
        >
          <option value="">Select a hall</option>
          {[...new Set(halls.map(h => h.hallName))].map((hall, i) => (
            <option key={i} value={hall}>{hall}</option>
          ))}
        </select>
        <select
          value={selectedTime}
          onChange={e => setSelectedTime(e.target.value)}
          style={{ flex: 1, padding: 8 }}
          disabled={!selectedHall}
        >
          <option value="">Select a time</option>
          {halls.filter(h => h.hallName === selectedHall).map((h, i) => (
            <option key={i} value={h.time}>{h.time}</option>
          ))}
        </select>
      </div>
      <button onClick={handleReserve} disabled={!selectedHall || !selectedTime || !user?.username || loading}>
        Reserve
      </button>
      {message && <p>{message}</p>}
      <div style={{ marginTop: 32 }}>
        <a href="/hall-reservation/reservations" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          View All Reservations
        </a>
      </div>
    </div>
  );
}
