"use client";

import { useState, useEffect } from "react";
import Agent from "@/components/Agent";
import InterviewSetup from "@/components/InterviewSetup";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = () => {
  const [user, setUser] = useState<any>(null);
  const [showAgent, setShowAgent] = useState(false);
  const [interviewData, setInterviewData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  const handleStartInterview = (data: any) => {
    setInterviewData(data); // Save setup data if needed
    setShowAgent(true);     // Show Agent after setup
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full border-b border-gray-200 pb-4 flex justify-center">
        <h3 className="text-primary font-semibold mt-4">Interview Generation</h3>
      </div>

      {!showAgent ? (
        <div className="my-8">
          <InterviewSetup onStartInterview={handleStartInterview} />
        </div>
      ) : (
        <Agent
          userName={user?.name || "Guest"}
          userId={user?.id}
          type="generate"
          // You can pass interviewData={interviewData} to Agent if needed
        />
      )}
    </>
  );
};

export default Page;
