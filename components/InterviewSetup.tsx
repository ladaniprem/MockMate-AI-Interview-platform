"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface InterviewData {
  interviewType: string;
  role: string;
  techStack: string[];
  duration: number;
  profileImage: string;
}

const InterviewSetup = ({ onStartInterview }: { onStartInterview: (data: InterviewData) => void }) => {
  const [interviewType, setInterviewType] = useState("Technical");
  const [role, setRole] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [duration, setDuration] = useState(15);
  const [profileImage, setProfileImage] = useState<string>("");

  const interviewTypes = ["Technical", "HR", "Managerial", "Behavioral"];
  const durationOptions = [10, 15, 20, 30, 45, 60];
  const techOptions = ["React", "Node.js", "TypeScript", "Python", "Java", "AWS", "SQL", "MongoDB"];

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleTechSelection = useCallback((tech: string) => {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((item) => item !== tech) : [...prev, tech]
    );
  }, []);

  const startInterview = () => {
    if (!role) {
      alert("Please specify your role");
      return;
    }
    onStartInterview({
      interviewType,
      role,
      techStack,
      duration,
      profileImage,
    });
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Customize Your Interview</h1>

      <div className="w-full space-y-8">

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-2">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                width={140}
                height={140}
                className="rounded-full object-cover size-[140px] border-4 border-purple-500/30 shadow-lg shadow-purple-500/20"
              />
            ) : (
              <div className="w-[140px] h-[140px] bg-gray-800/60 rounded-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-600">
                <span className="text-sm">Upload Photo</span>
              </div>
            )}
            <label htmlFor="image-upload" className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full cursor-pointer shadow-md transition-all transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white size-5">
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                <path d="m9 15 3-3 3 3"></path>
                <path d="M12 12V9"></path>
                <path d="M5 5v14"></path>
              </svg>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">Upload your profile picture</p>
        </div>

        {/* Interview Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Interview Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {interviewTypes.map((type) => (
              <button
                key={type}
                className={`py-2 px-4 rounded-lg transition-all ${
                  interviewType === type 
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setInterviewType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-2">Your Role</label>
          <input
            id="role"
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            placeholder="e.g. Frontend Developer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-medium mb-2">Tech Stack</label>
          <div className="flex flex-wrap gap-2">
            {techOptions.map((tech) => (
              <button
                key={tech}
                className={`py-1 px-3 text-sm rounded-full transition-all transform hover:scale-105 ${
                  techStack.includes(tech) 
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => handleTechSelection(tech)}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
          <div className="flex flex-wrap gap-3">
            {durationOptions.map((time) => (
              <button
                key={time}
                className={`py-2 px-4 rounded-lg transition-all transform hover:scale-105 ${
                  duration === time 
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setDuration(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-6 flex justify-center">
          <button
            className="w-full md:w-auto md:px-10 py-3.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 transform hover:scale-105 hover:shadow-purple-500/30 flex items-center justify-center gap-2"
            onClick={startInterview}
          >
            <span>Start Interview</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21"></polygon>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default InterviewSetup;
