import { ApiDomain } from "../../../../constant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { exercise_questions } = await request.json();

    if (!exercise_questions || !Array.isArray(exercise_questions) || exercise_questions.length === 0) {
      return NextResponse.json(
        { error: "Exercise questions array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const response = await fetch(
      `${ApiDomain}/graded-assignments/generate-answer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exercise_questions }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Backend error", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
