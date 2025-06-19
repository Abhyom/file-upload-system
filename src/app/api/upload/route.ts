import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { generateId } from "@/lib/fileUtils";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const folderId = formData.get("folderId") as string;

		if (!file) {
			return NextResponse.json(
				{ error: "No file received" },
				{ status: 400 }
			);
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Create unique filename
		const fileId = generateId();
		const fileExtension = file.name.split(".").pop();
		const filename = `${fileId}.${fileExtension}`;

		// Save to public/uploads directory
		const uploadDir = join(process.cwd(), "public", "uploads");
		const filePath = join(uploadDir, filename);

		await writeFile(filePath, buffer);

		return NextResponse.json({
			message: "File uploaded successfully",
			filePath: `/uploads/${filename}`,
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 }
		);
	}
}
