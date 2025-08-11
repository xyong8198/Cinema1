"use client";

import { useState, useEffect } from "react";
import { EditUserProps, ProfileEditForm } from "@/components/ProfileEditForm";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditUserProfilepage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<EditUserProps>({
    id: "",
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    profilePictureUrl: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed user:", parsedUser); // Debug log

        if (!parsedUser || typeof parsedUser !== "object") {
          throw new Error("Invalid user data");
        }

        setUserInfo({
          id: parsedUser.id,
          fullName: parsedUser.fullName || "",
          username: parsedUser.username || "",
          email: parsedUser.email || "",
          phoneNumber: parsedUser.phoneNumber || "",
          profilePictureUrl: parsedUser.profilePictureUrl || "",
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleProfileUpdate = async (formData: User) => {
    console.log("Form submitted:", formData);
    // Add your API call to update user profile
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userInfo) {
    return <div>No user data available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div>
        <Link href="/profile">
          <img
            src="https://cdn-icons-png.flaticon.com/512/93/93634.png"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(29%) sepia(83%) saturate(3700%) hue-rotate(267deg) brightness(91%) contrast(97%)",
            }}
            className="h-[30px] w-[30px]"
            alt="Back"
          />
        </Link>
      </div>
      <div className="mt-[2vh]">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        <ProfileEditForm user={userInfo} onSubmit={handleProfileUpdate} />
      </div>
    </div>
  );
}
