import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import ProfileCard from "@/components/ProfileCard"; // We import the ProfileCard separately

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <ProfileCard user={user} />
    </div>
  );
}
