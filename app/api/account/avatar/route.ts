import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../../lib/auth";
import { validateSameOrigin } from "../../../../lib/request-security";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const originError = validateSameOrigin(request);
  if (originError) {
    return originError;
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "File not found." }, { status: 400 });
  }

  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json({ message: "Unsupported file type." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ message: "File must be 2MB or smaller." }, { status: 400 });
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!blobToken) {
    return NextResponse.json(
      { message: "Avatar storage is not configured. Set BLOB_READ_WRITE_TOKEN." },
      { status: 503 }
    );
  }

  const fileExt = ALLOWED_TYPES[file.type];
  const fileName = `avatars/${session.user.id}/${Date.now()}.${fileExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const blob = await put(fileName, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
    token: blobToken,
  });

  return NextResponse.json({ avatarUrl: blob.url });
}
