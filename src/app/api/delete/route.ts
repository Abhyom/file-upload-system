import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { deleteFile, getFileById } from "@/lib/database";

export async function POST(request: NextRequest) {
	try {
		const { fileId } = await request.json();

		if (!fileId) {
			return NextResponse.json(
				{ error: "No file ID provided" },
				{ status: 400 }
			);
		}

		const file = await getFileById(fileId);
		if (!file) {
			return NextResponse.json(
				{ error: "File not found" },
				{ status: 404 }
			);
		}

		const absolutePath = join(process.cwd(), "public", file.path);
		await unlink(absolutePath);
		await deleteFile(fileId);

		return NextResponse.json({ message: "File deleted successfully" });
	} catch (error: any) {
		console.error("Delete error:", error.message);
		return NextResponse.json(
			{ error: `Failed to delete file: ${error.message}` },
			{ status: 500 }
		);
	}
}
