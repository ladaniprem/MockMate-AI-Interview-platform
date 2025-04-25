import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <div className="w-full border-b border-gray-200 pb-4 flex justify-center">
        <h3 className="text-primary font-semibold mt-4">Interview generation</h3>
      </div>

      <Agent
        userName={user?.name || "Guest"}
        userId={user?.id}
        type="generate"
      />
    </>
  );
};

export default Page;
