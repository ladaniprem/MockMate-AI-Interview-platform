"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
    name: string;
    email: string;
    image?: string;
}

export default function ProfileCard({ user }: { user: User }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<User>({ ...user });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSignOut = () => {
        router.push("/sign-in");
    };

    const handleImageClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setEditedUser({
                    ...editedUser,
                    image: e.target?.result as string
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedUser({
            ...editedUser,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = () => {
        // Implement API call to save user data
        // For now, we just update the local state
        user = editedUser;
        setIsEditing(false);
    };

    return (
        <div className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500 bg-white dark:bg-gray-900">
            {/* Profile Picture */}
            <div className="flex flex-col items-center p-6 relative">
                <div 
                    className={`relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg mb-4 ${isEditing ? 'cursor-pointer' : ''}`}
                    onClick={handleImageClick}
                >
                    <Image
                        src={editedUser.image || "/profile user.svg"}
                        alt="User Avatar"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                    />
                    {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white text-sm font-medium">Change Photo</span>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />

                {/* User Info */}
                {isEditing ? (
                    <div className="w-full space-y-3">
                        <div>
                            <label htmlFor="name" className="text-sm text-gray-600 dark:text-gray-400">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={editedUser.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={editedUser.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{editedUser.name}</h2>
                        <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">{editedUser.email}</p>
                    </>
                )}

                {/* Decorative Line */}
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mt-4"></div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Buttons Section */}
            <div className="p-6 flex flex-col gap-4">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSaveProfile}
                            className="w-full py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold tracking-wide transition duration-300"
                        >
                            Save Profile
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditedUser({ ...user });
                            }}
                            className="w-full py-3 rounded-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold tracking-wide transition duration-300"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold tracking-wide transition duration-300"
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold tracking-wide transition duration-300"
                        >
                            Sign Out
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
