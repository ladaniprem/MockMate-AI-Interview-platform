"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InterviewSetup from "@/components/InterviewSetup";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  const handleStartInterview = async (data: {
    interviewType: string;
    role: string;
    techStack: string[];
    level: string;
    amount: number;
  }) => {
    if (!user?.id) {
      alert("User not found. Please sign in again.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.interviewType,
          role: data.role,
          level: data.level,
          techstack: data.techStack.join(","),
          amount: data.amount,
          userid: user.id,
        }),
      });

      const result = await response.json();

      if (result.success && result.id) {
        router.push(`/interview/${result.id}`);
      } else {
        console.error("Failed to generate interview:", result);
        alert("Failed to generate interview. Please try again.");
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Error generating interview:", error);
      alert("An error occurred. Please try again.");
      setIsGenerating(false);
    }
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

      <div className="my-8">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-lg text-gray-400">Generating your interview questions...</p>
          </div>
        ) : (
          <InterviewSetup onStartInterview={handleStartInterview} />
        )}
      </div>
    </>
  );
};

export default Page;
