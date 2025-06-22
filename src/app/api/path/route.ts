import { NextRequest, NextResponse } from "next/server";
import { getFolderPath } from "@/lib/database";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const folderId = searchParams.get("folderId") || "root";

		const path = await getFolderPath(folderId);
		return NextResponse.json(path);
	} catch (error: any) {
		console.error("Error fetching folder path:", error.message);
		return NextResponse.json(
			{ error: `Failed to fetch folder path: ${error.message}` },
			{ status: 500 }
		);
	}
}
