import {
  Cinema,
  DetailedMovie,
  LazyShowtime,
  Movie,
  Showtime,
} from "@/types/movie";
import { User } from "@/types/user";
import Cookies from "js-cookie";

//const BASE_URL = "https://absolute-cinema-2.onrender.com/api";

const BASE_URL = "http://localhost:8080/api";

const getAuthToken = (): string => {
  if (typeof window === "undefined") {
    return ""; // No token in server-side context
  }

  // First try to get from cookie (set by AuthContext)
  const cookieToken = Cookies.get("auth_token");
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to localStorage for backward compatibility
  const localToken = localStorage.getItem("auth_token");
  if (localToken) {
    // Sync the token to cookie for future use
    Cookies.set("auth_token", localToken, {
      expires: 7,
      path: "/",
      secure: window.location.protocol === "https:",
      sameSite: "strict",
    });
    return localToken;
  }

  // Default fallback (for development only - remove in production)
  return "";
};

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    Cookies.remove("auth_token");
    Cookies.remove("user_role");
  }
}

// Movie API functions
export async function getAllMovies(): Promise<Movie[]> {
  try {
    console.log(`Fetching from: ${BASE_URL}/movies/all`); // Debug log

    const response = await fetch(`${BASE_URL}/movies/all`, {
      headers: {
        Accept: "*/*",
      },
      // Add mode to handle CORS if needed
      mode: "cors",
    });

    console.log("Response status:", response.status); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText); // Debug log
      throw new Error(
        `Failed to fetch movies: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Received data:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error in getMovies():", error);
    throw error;
  }
}

export async function filterMovies(category: string, criteria: string): Promise<Movie[]> {
  try {
    const params = new URLSearchParams({
      category: category,
      criteria: criteria
    });
    
    const response = await fetch(`${BASE_URL}/movies/filter?${params.toString()}`, {
      headers: {
        Accept: "*/*",
      },
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`Failed to filter movies: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error in filterMovies():", error);
    throw error;
  }
}

export async function getFilterOptions(category: string): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/movies/filter-options/${category}`, {
      headers: {
        Accept: "*/*",
      },
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`Failed to get filter options: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error in getFilterOptions():", error);
    throw error;
  }
}

export async function getMovieById(id: number): Promise<Movie> {
  const response = await fetch(`${BASE_URL}/movies/${id}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch movie with id ${id}`);
  }
  return response.json();
}

export async function getMovieDetailsById(id: number): Promise<DetailedMovie> {
  const response = await fetch(`${BASE_URL}/movies/review/byId/${id}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch movie with id ${id}`);
  }
  return response.json();
}

export async function getMovieDetailsByTitle(
  title: string
): Promise<DetailedMovie> {
  const response = await fetch(`${BASE_URL}/movies/review/byTitle/${title}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch movie with title ${title}`);
  }
  return response.json();
}

export async function createMovie(movie: Omit<Movie, "id">): Promise<Movie> {
  console.log("Creating movie");
  const response = await fetch(`${BASE_URL}/movies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(movie),
  });

  if (!response.ok) {
    throw new Error("Failed to create movie");
  }

  return response.json();
}

export async function deleteMovie(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/movies/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete movie with id ${id}`);
  }
}

export async function updateMovie(
  movieId: number,
  movieData: Omit<Movie, "id">
): Promise<Movie> {
  const response = await fetch(`${BASE_URL}/movies/${movieId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(movieData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update movie: ${errorText}`);
  }

  return response.json();
}

// Showtime API functions
export async function getShowtimesByMovie(
  movieId: number
): Promise<Showtime[]> {
  console.log("TOKEN", getAuthToken());
  const response = await fetch(`${BASE_URL}/showtimes/movies/${movieId}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch showtimes for movie ${movieId}`);
  }
  return response.json();
}

export async function getShowtimesByCinema(
  cinemaId: number
): Promise<Showtime[]> {
  console.log("Fetching ", `${BASE_URL}/showtimes/cinemas/${cinemaId}`); // Debug log
  const response = await fetch(`${BASE_URL}/showtimes/cinemas/${cinemaId}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch showtimes for cinema ${cinemaId}`);
  }
  return response.json();
}

export async function getAllShowtimes(): Promise<LazyShowtime[]> {
  const response = await fetch(`${BASE_URL}/showtimes`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch showtimes`);
  }
  return response.json();
}

export async function createShowtime(
  showtimeData: Omit<LazyShowtime, "id">
): Promise<LazyShowtime> {
  console.log("Creating showtime:", showtimeData); // Debug log

  const response = await fetch(`${BASE_URL}/showtimes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(showtimeData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error creating showtime:", errorText); // Debug log
    throw new Error(`Failed to create showtime: ${errorText}`);
  }

  const data = await response.json();
  console.log("Created showtime:", data); // Debug log
  return data;
}

export async function updateShowtime(
  showtimeId: number,
  showtimeData: Omit<LazyShowtime, "id">
): Promise<LazyShowtime> {
  console.log("Updating showtime:", { id: showtimeId, ...showtimeData }); // Debug log

  const response = await fetch(`${BASE_URL}/showtimes/${showtimeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(showtimeData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error updating showtime:", errorText); // Debug log
    throw new Error(`Failed to update showtime: ${errorText}`);
  }

  const data = await response.json();
  console.log("Updated showtime:", data); // Debug log
  return data;
}

export async function deleteShowtime(showtimeId: number): Promise<void> {
  console.log("Deleting showtime:", showtimeId); // Debug log

  const response = await fetch(`${BASE_URL}/showtimes/${showtimeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error deleting showtime:", errorText); // Debug log
    throw new Error(`Failed to delete showtime: ${errorText}`);
  }

  console.log("Successfully deleted showtime:", showtimeId); // Debug log
}

// Getting Cinemas
export async function getAllCinemas(): Promise<Cinema[]> {
  const response = await fetch(`${BASE_URL}/cinemas`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch cinemas");
  }
  return response.json();
}

export async function getCinemaById(cinemaId: number): Promise<Cinema> {
  const response = await fetch(`${BASE_URL}/cinemas/${cinemaId}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch cinemas");
  }
  return response.json();
}

// Fetch available seats for a showtime
export const fetchSeats = async (showtimeId: string) => {
  const res = await fetch(`${BASE_URL}/seats/${showtimeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch seats.");
  return res.json();
};

// Process a payment
export const createPayment = async (bookingId: number) => {
  // Using URLSearchParams for proper request parameter formatting
  const params = new URLSearchParams({
    bookingId: bookingId.toString(),
  });

  const res = await fetch(`${BASE_URL}/payments/create?${params.toString()}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    // No body needed as we're using query parameters
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${errorText}`);
  }

  return res.text();
};

// Confirm a successful payment
export const makePayment = async (
  paymentId: number,
  paymentMethod: string,
  amount: number
) => {
  const res = await fetch(
    `${BASE_URL}/payments/pay?paymentId=${paymentId}&paymentMethod=${paymentMethod}&amount=${amount}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );
  if (!res.ok) throw new Error("Payment confirmation failed.");
  return res.text();
};

// Get booking information by ID
export async function getPaymentByBookingId(bookingId: string) {
  const response = await fetch(`${BASE_URL}/payments/${bookingId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch booking details: ${response.status}`);
  }

  return response.json();
}

// Request a refund for a booking
export const requestRefund = async (bookingId: string) => {
  const res = await fetch(`${BASE_URL}/payments/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ bookingId }),
  });
  if (!res.ok) throw new Error("Refund request failed.");
  return res.json();
};

// Fetch booking history
export const fetchBookingHistory = async () => {
  const res = await fetch(`${BASE_URL}/bookings/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      Accept: "*/*",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch booking history.");
  return res.json();
};

/**
 * Check if a movie is favorited by the current user
 */
export const checkIsFavorite = async (movieId: number): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some((fav) => fav.id === movieId);
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false; // Default to not favorited in case of error
  }
};

/**
 * Toggle a movie as favorite or unfavorite
 */
export const toggleFavorite = async (
  movieId: number,
  isFavorite: boolean
): Promise<void> => {
  const endpoint = isFavorite
    ? `${BASE_URL}/favorites/add/${movieId}`
    : `${BASE_URL}/favorites/remove/${movieId}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to ${isFavorite ? "add" : "remove"} favorite: ${errorText}`
    );
  }

  return;
};

/**
 * Get user's favorite movies
 */
export const getFavorites = async (): Promise<Movie[]> => {
  const response = await fetch(`${BASE_URL}/favorites`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch favorites");
  }

  return response.json();
};

// Fetch receipt
export async function fetchBookingReceipt(bookingId: number): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}/receipt`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching receipt: ${response.status}`);
    }

    // Get the PDF as a blob
    const blob = await response.blob();

    // Create a download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `booking-receipt-${bookingId}.pdf`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading receipt:", error);
  }
}

// Fetch ticket
export async function fetchBookingTicket(bookingId: number): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}/e-ticket`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching ticket: ${response.status}`);
    }

    // Get the PDF as a blob
    const blob = await response.blob();

    // Create a download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `e-ticket-${bookingId}.pdf`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading e-ticket:", error);
  }
}

interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials) {
  // Convert credentials to URLSearchParams
  const params = new URLSearchParams({
    email: credentials.email,
    password: credentials.password,
  });

  const response = await fetch(`${BASE_URL}/auth/login?${params.toString()}`, {
    method: "POST",
    headers: {
      Accept: "*/*",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error("Invalid credentials or unverified account");
    }
    throw new Error(`Login failed: ${errorText}`);
  }

  // Backend returns token directly as string
  const token = await response.text();
  //setToken(token);
  // console.warn(token);
  // AUTH_TOKEN = token;
  // console.warn(AUTH_TOKEN)
  return {
    token,
    success: true,
  };
}

interface registerCredentials {
  email: string;
  password: string;
  fullName: string;
  username: string;
  phoneNumber: string;
  profilePictureURL?: string;
}

export async function register(credentials: registerCredentials) {
  const body1 = JSON.stringify({
    email: credentials.email,
    password: credentials.password,
    fullName: credentials.fullName,
    username: credentials.username,
    phoneNumber: credentials.phoneNumber,
    profilePictureURL: credentials.profilePictureURL,
  });

  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
    },
    body: body1,
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error("Invalid credentials or unverified account");
    }
    throw new Error(`Registration failed: ${errorText}`);
  }

  const token = await response.text();

  return {
    success: true,
  };
}

interface URLSearchParams {
  email: string;
  otp: string;
}

export async function verify(credentials: URLSearchParams) {
  const params = new URLSearchParams({
    email: credentials.email,
    otp: credentials.otp,
  });

  const response = await fetch(`${BASE_URL}/auth/verify?${params.toString()}`, {
    method: "POST",
    headers: {
      Accept: "*/*",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error("Invalid credentials or unverified account");
    }
    throw new Error(`Login failed: ${errorText}`);
  }

  return {
    success: true,
  };
}

export async function getUser(token: string): Promise<User> {
  try {
    console.log(`Fetching from: ${BASE_URL}/auth/user`); // Debug log

    const response = await fetch(`${BASE_URL}/auth/user`, {
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      mode: "cors",
    });

    console.log("Response status:", response.status); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText); // Debug log
      throw new Error(
        `Failed to fetch movies: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Received data:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error in getUser():", error);
    throw error;
  }
}

// Get detailed showtime information for the booking page
export async function getShowtimeDetails(showtimeId: string) {
  const response = await fetch(`${BASE_URL}/showtimes/showtime/${showtimeId}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch showtime details: ${response.status}`);
  }

  return response.json();
}

// Create a booking
export async function createBooking(seatIds: string[]) {
  console.log("Creating booking:", { seats: seatIds });

  // Convert seat IDs to query parameters
  // For multiple values of the same parameter name, we need to repeat the parameter
  const queryParams = seatIds.map((id) => `selectedSeatIds=${id}`).join("&");
  const url = `${BASE_URL}/bookings?${queryParams}`;
  console.log("Booking URL:", url);
  console.log("seat:", queryParams);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      // "Authorization": `Bearer ${token}`,
      Authorization: `Bearer ${getAuthToken()}`,

      "Content-Type": "application/json",
    },
    // No body needed as we're using query parameters
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Booking creation failed:", errorText);
    throw new Error(`Failed to create booking: ${errorText}`);
  }

  const bookingData = await response.json();
  console.log("Booking created successfully:", bookingData);
  return bookingData;
}

// Get booking information by ID
export async function getBookingById(bookingId: string) {
  const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch booking details: ${response.status}`);
  }

  return response.json();
}

interface UserUpdate {
  fullName: string;
  username: string;
  email: string;
  newPassword: string;
  phoneNumber: string;
  profilePictureUrl: string;
}

export async function updateUser(userId: string, userUpdate: UserUpdate) {
  console.log(userId);
  // Add the id as a query parameter
  const response = await fetch(`${BASE_URL}/auth/update?id=${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(userUpdate),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update user: ${errorText}`);
  }

  return response.json();
}

interface userUpdate {
  fullName: string;
  username: string;
  email: string;
  newPassword: string;
  phoneNumber: string;
  profilePictureUrl: string;
}

/**
 * Request a password reset email by providing the user's email address
 * @param email The email address associated with the account
 */
export async function sendOtpEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Using URLSearchParams for proper request parameter formatting
    const params = new URLSearchParams({
      email: email,
    });

    const response = await fetch(
      `${BASE_URL}/auth/otp-password-reset-token?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*/*",
        },
      }
    );

    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Forgot password error:", errorText);

      if (response.status === 404) {
        throw new Error("Email not found. Please check your email address.");
      } else {
        throw new Error(`Password reset request failed: ${errorText}`);
      }
    }

    // Return success response
    return {
      success: true,
      message: "Password reset instructions have been sent to your email.",
    };
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Verify OTP and get reset token
 * @param email The user's email address
 * @param otp The one-time password sent to the user's email
 */
export async function verifyOtp(
  email: string,
  otp: string
): Promise<{ success: boolean; token?: string; message: string }> {
  try {
    const params = new URLSearchParams({
      email: email,
      otp: otp,
    });

    const response = await fetch(
      `${BASE_URL}/auth/verify-password-reset-otp?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*/*",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OTP verification error:", errorText);

      if (response.status === 400) {
        throw new Error("Invalid or expired OTP.");
      } else {
        throw new Error(`OTP verification failed: ${errorText}`);
      }
    }

    // Backend returns the token as text
    const token = await response.text();

    return {
      success: true,
      token: token,
      message: "OTP verified successfully. You can now reset your password.",
    };
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Reset password using the token received after OTP verification
 * @param email The user's email address
 * @param token The reset token received after OTP verification
 * @param newPassword The new password
 */
export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const params = new URLSearchParams({
      email: email,
      token: token,
      newPassword: newPassword,
    });

    const response = await fetch(
      `${BASE_URL}/auth/reset-password?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*/*",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Password reset error:", errorText);

      if (response.status === 400) {
        throw new Error("Invalid or expired reset token.");
      } else {
        throw new Error(`Password reset failed: ${errorText}`);
      }
    }

    // Assuming the backend returns a success message
    const message = await response.text();

    return {
      success: true,
      message:
        message ||
        "Password reset successfully. You can now log in with your new password.",
    };
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
