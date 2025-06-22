import { NextRequest, NextResponse } from "next/server";
import { getFolderContents, initializeDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
	try {
		await initializeDatabase();
		const { searchParams } = new URL(request.url);
		const folderId = searchParams.get("folderId") || "root";

		const contents = await getFolderContents(folderId);
		return NextResponse.json(contents);
	} catch (error: any) {
		console.error("Error fetching folder contents:", error.message);
		return NextResponse.json(
			{ error: `Failed to fetch folder contents: ${error.message}` },
			{ status: 500 }
		);
	}
}
