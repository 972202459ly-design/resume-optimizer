import { NextRequest } from "next/server";
import { isPaid } from "@/lib/db";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return Response.json({ paid: false });
  }
  try {
    const paid = await isPaid(id);
    return Response.json({ paid });
  } catch (err) {
    console.error("paid-check error:", err);
    return Response.json({ paid: false });
  }
}
