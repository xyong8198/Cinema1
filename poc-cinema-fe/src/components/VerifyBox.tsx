"use client";

import { verify } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function VerifyBox() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    setEmail(storedEmail);

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format OTP input
  const formatOtp = (value: string) => {
    // Allow only digits and limit to 6 characters
    return value.replace(/[^\d]/g, "").substring(0, 6);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await verify({ email, otp });
      console.log("Verification successful:", response);
      router.replace("/login?verified=true");
    } catch (err) {
      console.error("Verification error:", err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setResending(true);
    setError("");

    try {
      // Call your API to resend the OTP
      // await resendOtp(email);

      // Reset countdown
      setCountdown(60);
    } catch (err) {
      console.error("Error resending OTP:", err);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-block mb-4">
          <Image
            src="https://i.imgur.com/QAErof7.png"
            width={60}
            height={60}
            alt="Absolute Cinema Logo"
            className="mx-auto"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Verify Your Account
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          We've sent a 6-digit verification code to {email}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(formatOtp(e.target.value))}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center tracking-widest text-xl font-mono transition-colors duration-200"
            maxLength={6}
            autoComplete="one-time-code"
            required
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify Account"
            )}
          </button>
        </div>
      </form>

      <div className="text-center mt-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResendOtp}
          disabled={countdown > 0 || resending}
          className={`text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium ${
            countdown > 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {resending
            ? "Sending..."
            : countdown > 0
            ? `Resend code in ${countdown}s`
            : "Resend verification code"}
        </button>

        <p className="mt-6 text-gray-600 dark:text-gray-400">
          <Link
            href="/login"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
