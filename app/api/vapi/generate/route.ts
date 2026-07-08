import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { text: questionsText } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    let questions: string[];
    try {
      questions = JSON.parse(questionsText);
    } catch {
      // If Gemini wraps them in markdown code block, extract the JSON
      const jsonMatch = questionsText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines and filter
        questions = questionsText
          .split("\n")
          .map((q) => q.replace(/^\d+[\.\)]\s*/, "").trim())
          .filter((q) => q.length > 0);
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      questions = ["Tell me about yourself.", "What are your strengths and weaknesses?", "Why do you want this role?"];
    }

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);

    return Response.json({ success: true, id: docRef.id }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating interview:", message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
