import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../../lib/auth";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "Файл не найден." }, { status: 400 });
  }

  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json({ message: "Неподдерживаемый тип файла." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ message: "Файл больше 2MB." }, { status: 400 });
  }

  const fileExt = ALLOWED_TYPES[file.type];
  const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  const filePath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return NextResponse.json({ avatarUrl: `/uploads/avatars/${fileName}` });
}
