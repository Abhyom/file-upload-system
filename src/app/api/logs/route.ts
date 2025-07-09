import { NextRequest, NextResponse } from "next/server";
import { getFileLogs } from "@/lib/database";

export async function GET(request: NextRequest) {
	try {
		const logs = await getFileLogs();
		return NextResponse.json(logs);
	} catch (error: any) {
		console.error("Error fetching file logs:", error.message);
		return NextResponse.json(
			{ error: `Failed to fetch file logs: ${error.message}` },
			{ status: 500 }
		);
	}
}
