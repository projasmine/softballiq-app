import { auth } from "@/lib/auth-config";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only MP4, MOV, WebM, and M4V videos are supported" },
      { status: 400 }
    );
  }

  // Limit file size (100MB)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "File size must be under 100MB" },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`videos/${session.user.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 }
    );
  }
}
