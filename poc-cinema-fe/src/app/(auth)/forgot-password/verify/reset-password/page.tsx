import ForgotPasswordBox from "@/components/ForgotPasswordBox";
import LoginBox from "@/components/LoginBox";
import Image from "next/image";
import VerifyPasswordOtpBox from "@/components/VerifyPasswordOtpBox";
import ResetPasswordBox from "@/components/ResetPasswordBox";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side with image */}
      <div className="hidden md:block w-[55vw] relative">
        <Image
          src="https://images.unsplash.com/photo-1627133805065-5083466be4f7?q=80&amp;w=3087&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.0.3&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Cinema interior"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 0vw, 55vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          <h1 className="text-3xl font-bold mb-3">Welcome Back</h1>
          <p className="text-lg">
            Sign in to access your bookings, preferences, and exclusive cinema
            deals.
          </p>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="flex justify-center items-center w-full md:w-[45vw] min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full max-w-md p-6">
          <ResetPasswordBox />
        </div>
      </div>
    </div>
  );
}
