import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { generateId } from "@/lib/fileUtils";
import { createFile } from "@/lib/database";

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

		const fileId = generateId();
		const fileExtension = file.name.split(".").pop();
		const filename = `${fileId}.${fileExtension}`;

		const uploadDir = join(process.cwd(), "public", "uploads");
		await mkdir(uploadDir, { recursive: true });
		const filePath = join(uploadDir, filename);

		await writeFile(filePath, buffer);

		await createFile({
			name: file.name,
			size: file.size,
			mimeType: file.type,
			path: `/uploads/${filename}`,
			folderId: folderId || "root",
		});

		return NextResponse.json({
			message: "File uploaded successfully",
			filePath: `/uploads/${filename}`,
		});
	} catch (error: any) {
		console.error("Upload error:", error.message);
		return NextResponse.json(
			{ error: `Failed to upload file: ${error.message}` },
			{ status: 500 }
		);
	}
}

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "10mb",
		},
	},
};
