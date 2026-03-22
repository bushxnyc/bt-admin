import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;

  if (!apiKey || !projectId) {
    return NextResponse.json({ error: "PostHog not configured" }, { status: 500 });
  }

  const response = await fetch(
    `https://us.posthog.com/api/projects/${projectId}/persons/?email=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: "PostHog API error" }, { status: response.status });
  }

  const data = await response.json();
  const person = data.results?.[0];

  if (!person) {
    return NextResponse.json({ error: "Person not found in PostHog" }, { status: 404 });
  }

  const distinctId = person.distinct_ids?.[0];
  const url = `https://us.posthog.com/project/${projectId}/person/${encodeURIComponent(distinctId)}`;
  return NextResponse.json({ distinctId, url });
}
