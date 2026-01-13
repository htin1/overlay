import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const url = await storage.upload(Buffer.from(await file.arrayBuffer()), filename);

  return NextResponse.json({ url, filename });
}
