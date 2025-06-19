import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
	try {
		const { filePath } = await request.json();

		if (!filePath) {
			return NextResponse.json(
				{ error: "No file path provided" },
				{ status: 400 }
			);
		}

		// Resolve the absolute path to the file
		const absolutePath = join(process.cwd(), "public", filePath);

		// Delete the file
		await unlink(absolutePath);

		return NextResponse.json({ message: "File deleted successfully" });
	} catch (error) {
		console.error("Delete error:", error);
		return NextResponse.json(
			{ error: "Failed to delete file" },
			{ status: 500 }
		);
	}
}
