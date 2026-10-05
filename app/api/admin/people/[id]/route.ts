import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveUploadedPhoto } from "@/lib/sms/media";
import { photoUploadError, uploadFromForm } from "@/lib/admin/photo-upload";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Person id required" }, { status: 400 });
  }

  const form = await request.formData();
  const data: { age?: number | null; photoUrl?: string } = {};

  if (form.has("age")) {
    const raw = String(form.get("age") || "").trim();
    if (!raw) {
      data.age = null;
    } else {
      const age = Number(raw);
      if (!Number.isInteger(age) || age < 18 || age > 99) {
        return NextResponse.json({ error: "Age needs to be between 18 and 99." }, { status: 400 });
      }
      data.age = age;
    }
  }

  const photo = uploadFromForm(form.get("photo"));
  if (photo) {
    const invalid = photoUploadError(photo);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    try {
      data.photoUrl = await saveUploadedPhoto(Buffer.from(await photo.arrayBuffer()), photo.type || null);
    } catch (error) {
      console.error("admin photo upload failed", error);
      return NextResponse.json({ error: "Could not save that photo." }, { status: 500 });
    }
  }

  if (data.age === undefined && !data.photoUrl) {
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  }

  try {
    const person = await prisma.person.update({ where: { id }, data });
    return NextResponse.json({ ok: true, age: person.age, photoUrl: person.photoUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Person id required" }, { status: 400 });
  }

  try {
    await prisma.person.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
