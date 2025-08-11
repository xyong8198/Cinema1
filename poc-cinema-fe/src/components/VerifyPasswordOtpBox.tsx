"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, login as loginUser, sendOtpEmail, verifyOtp } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { send } from "process";

export default function VerifyPasswordOtpBox() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const storedEmail = localStorage.getItem("forgotPasswordEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log(email)
      const response = await verifyOtp(email,otp);
      if(response.token){
        localStorage.setItem("forgotPasswordToken", response.token);
      }
      console.log(response)
      

      // Redirect to homepage or intended destination
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get("returnUrl") || "/";
      router.push("verify/reset-password")
    } catch (err) {
      setError("Invalid Otp");
    } finally {
      setLoading(false);
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
          Forgot Password
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Enter your email to receive an otp to reset your password
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Otp
          </label>
          <input
            id="otp"
            type="text"
            placeholder="Enter your otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
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
                Submit
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
