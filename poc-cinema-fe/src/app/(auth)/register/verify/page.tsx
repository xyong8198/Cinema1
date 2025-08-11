import VerifyBox from "@/components/VerifyBox";
import Image from "next/image";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side with image */}
      <div className="hidden md:block w-[55vw] relative">
        <Image
          src="https://images.unsplash.com/photo-1627133805065-5083466be4f7?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3"
          alt="Cinema interior"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 0vw, 55vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          <h1 className="text-3xl font-bold mb-3">Verify Your Account</h1>
          <p className="text-lg">
            You&apos;re almost there! Please verify your email to complete your
            registration.
          </p>
        </div>
      </div>

      {/* Right side with verification form */}
      <div className="flex justify-center items-center w-full md:w-[45vw] min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full max-w-md p-6">
          <VerifyBox />
        </div>
      </div>
    </div>
  );
}
