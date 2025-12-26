import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { automationRequestSchema } from "@/lib/schemas";
import { generateContent } from "@/lib/generation";
import {
  postToInstagram,
  postToLinkedIn,
  postToMeta,
} from "@/lib/platforms";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = automationRequestSchema.parse(body);

    const generation = await generateContent(parsed);

    const platformResults = await Promise.all(
      [
        parsed.platforms.meta.enabled
          ? postToMeta(
              {
                token: parsed.platforms.meta.token,
                pageId: parsed.platforms.meta.pageId,
              },
              `${generation.title}\n\n${generation.summary}\n\n${generation.blogPost}`,
            )
          : { platform: "meta", success: false, message: "Meta skipped" },
        parsed.platforms.instagram.enabled
          ? postToInstagram(
              {
                token: parsed.platforms.instagram.token,
                instagramBusinessId:
                  parsed.platforms.instagram.instagramBusinessId,
                mediaUrl: parsed.platforms.instagram.mediaUrl,
              },
              generation.instagramCaption,
            )
          : {
              platform: "instagram",
              success: false,
              message: "Instagram skipped",
            },
        parsed.platforms.linkedin.enabled
          ? postToLinkedIn(
              {
                token: parsed.platforms.linkedin.token,
                authorUrn: parsed.platforms.linkedin.linkedinAuthorUrn,
              },
              generation.linkedinPost,
            )
          : {
              platform: "linkedin",
              success: false,
              message: "LinkedIn skipped",
            },
      ],
    );

    return NextResponse.json(
      {
        generation,
        platformResults,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: error.issues.map((issue) => issue.message),
        },
        { status: 422 },
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
