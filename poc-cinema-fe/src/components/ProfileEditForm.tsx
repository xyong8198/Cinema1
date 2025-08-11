import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import toast from "react-hot-toast";
import { updateUser } from "@/lib/api";

const DEFAULT_PROFILE_IMAGE = "https://via.placeholder.com/80";

export interface EditUserProps {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
}

export interface ProfileEditFormProps {
  user: EditUserProps;
  onSubmit: (formData: User) => Promise<void>;
}

export interface FormData {
  fullName: string;
  username: string;
  email: string;
  newPassword: string;
  phoneNumber: string;
  profilePictureUrl: string;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>(() => ({
    fullName: user.fullName || "",
    username: user.username || "",
    email: user.email || "",
    newPassword: "",
    phoneNumber: user.phoneNumber || "",
    profilePictureUrl: user.profilePictureUrl || DEFAULT_PROFILE_IMAGE,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(
    user.profilePictureUrl || DEFAULT_PROFILE_IMAGE
  );
  const [activeSection, setActiveSection] = useState<string>("general");

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Update preview if profile URL changes
    if (name === "profilePictureUrl" && value) {
      setPreviewUrl(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call API to update user
      const updatedUser = await updateUser(user.id, formData);

      // Update localStorage with new user data
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedUserData = {
          ...parsedUser,
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          profilePictureUrl: formData.profilePictureUrl,
        };

        // Save updated data to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUserData));
      }

      toast.success("Profile updated successfully!");
      router.replace("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define the navigation items for the form sections
  const navItems = [
    {
      id: "general",
      label: "General Info",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300">
      <div className="md:flex">
        {/* Sidebar for navigation on larger screens */}
        <div className="md:w-64 bg-gray-50 dark:bg-gray-900 p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md transition-transform duration-300 group-hover:scale-105">
                <img
                  src={previewUrl || DEFAULT_PROFILE_IMAGE}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black bg-opacity-50 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
              {user.fullName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{user.username}
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center px-4 py-3 w-full rounded-lg transition-colors hover: cursor-pointer ${
                  activeSection === item.id
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form content */}
        <div className="flex-1 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeSection === "general" && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  General Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="profilePictureUrl"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Profile Picture URL
                    </label>
                    <div className="mt-1 flex rounded-lg shadow-sm">
                      <input
                        type="url"
                        name="profilePictureUrl"
                        id="profilePictureUrl"
                        value={formData.profilePictureUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Enter a URL for your profile picture
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeSection === "security" && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                      placeholder="Leave blank to keep current password"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          Security notice
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                          For security reasons, you'll need to re-login after
                          changing your password.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-5 mt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  onClick={() => router.push("/profile")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${
                    isSubmitting
                      ? "bg-purple-400 dark:bg-purple-500 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
