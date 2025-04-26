"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const AvatarMenu = () => {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleSignOut = () => {
    router.push("/sign-in");
  };

  return (
    <div className="relative">
      {user && (
        <>
          <button
            className="flex items-center focus:outline-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full object-cover size-[40px]"
              />
            ) : (
              <Image
                src="/profile user.svg"
                alt="Default User Avatar"
                width={40}
                height={40}
                className="rounded-full object-cover size-[40px]"
              />
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
              <Link
                href="/profile"
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
              >
                Profile
              </Link>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AvatarMenu;
