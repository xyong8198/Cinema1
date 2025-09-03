// src/lib/hallReservationApi.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function fetchAvailableHalls() {
  const res = await fetch(`${BASE_URL}/hall-reservation`);
  if (!res.ok) throw new Error("Failed to fetch halls");
  return res.json();
}

export async function fetchAllReservations() {
  const res = await fetch(`${BASE_URL}/hall-reservation/reservations`);
  if (!res.ok) throw new Error("Failed to fetch reservations");
  return res.json();
}

export async function reserveHall({ hallName, time, username }: { hallName: string; time: string; username: string }) {
  const res = await fetch(`${BASE_URL}/hall-reservation/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hallName, time, username }),
  });
  if (!res.ok) throw new Error("Failed to reserve hall");
  return res.text();
}
