import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import AvatarMenu from "@/components/AvatarMenu"; 

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();
  let userInterviews = [];
  let allInterviews = [];
  let hasPastInterviews = false;
  let hasUpcomingInterviews = false;

  try {
    const [userInterviewsResult, allInterviewsResult] = await Promise.all([
      getInterviewsByUserId(user?.id ?? ""),
      getLatestInterviews({ userId: user?.id ?? "" }),
    ]);

    userInterviews = userInterviewsResult ?? [];
    allInterviews = allInterviewsResult ?? [];

    hasPastInterviews = userInterviews.length > 0;
    hasUpcomingInterviews = allInterviews.length > 0;

  } catch (error) {
    console.error("Error fetching interviews:", error);
    return <p>Error fetching interviews</p>;
  }

  return (
    <>
      {/* Top Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <AvatarMenu /> 
      </header>

      {/*  Main  Content */}
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <>
              <InterviewCard
                key="sample-frontend"
                userId={user?.id}
                interviewId="sample-frontend"
                role="Frontend Developer"
                type="Technical"
                techstack={["React", "JavaScript", "CSS"]}
                createdAt={new Date().toISOString()}
              />
              <InterviewCard
                key="sample-backend"
                userId={user?.id}
                interviewId="sample-backend"
                role="Backend Developer"
                type="Technical"
                techstack={["Node.js", "Express", "MongoDB"]}
                createdAt={new Date().toISOString()}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
