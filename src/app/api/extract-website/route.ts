import { NextResponse } from "next/server";
import { extractFromWebsite } from "@/lib/extract";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const extraction = await extractFromWebsite(url);

    return NextResponse.json(extraction);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to extract website data";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
