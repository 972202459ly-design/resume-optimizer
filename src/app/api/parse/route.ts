import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    // PDF
    if (fileName.endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      const text = result.text.trim();
      if (!text) {
        return Response.json({ error: "Could not extract text from PDF. The file may be scanned or image-based." }, { status: 400 });
      }
      if (text.length > 10000) {
        return Response.json({ text: text.slice(0, 10000) + "\n\n[Truncated to 10,000 characters]" });
      }
      return Response.json({ text });
    }

    // DOCX
    if (fileName.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value.trim();
      if (!text) {
        return Response.json({ error: "Could not extract text from DOCX file." }, { status: 400 });
      }
      if (text.length > 10000) {
        return Response.json({ text: text.slice(0, 10000) + "\n\n[Truncated to 10,000 characters]" });
      }
      return Response.json({ text });
    }

    return Response.json({ error: "Unsupported file type. Please upload a PDF or DOCX file." }, { status: 400 });
  } catch (err) {
    console.error("Parse error:", err);
    return Response.json({ error: "Failed to parse file. Please try again." }, { status: 500 });
  }
}
