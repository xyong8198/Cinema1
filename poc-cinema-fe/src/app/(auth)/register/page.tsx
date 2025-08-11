import RegisterBox from "@/components/RegisterBox";
import Image from "next/image";

export default function RegisterPage() {
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
          <h1 className="text-3xl font-bold mb-3">Join Absolute Cinema</h1>
          <p className="text-lg">
            Create an account to book tickets, save your favorite movies, and
            receive special offers.
          </p>
        </div>
      </div>

      {/* Right side with registration form */}
      <div className="flex justify-center items-center w-full md:w-[45vw] min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full max-w-md p-6">
          <RegisterBox />
        </div>
      </div>
    </div>
  );
}
