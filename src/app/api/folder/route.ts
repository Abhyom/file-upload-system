import { NextRequest, NextResponse } from "next/server";
import { createFolder } from "@/lib/database";

export async function POST(request: NextRequest) {
	try {
		const { name, parentId } = await request.json();

		if (!name || !parentId) {
			return NextResponse.json(
				{ error: "Name and parentId are required" },
				{ status: 400 }
			);
		}

		const folder = await createFolder(name, parentId);
		return NextResponse.json({
			message: "Folder created successfully",
			folder,
		});
	} catch (error: any) {
		console.error("Error creating folder:", error.message);
		return NextResponse.json(
			{ error: `Failed to create folder: ${error.message}` },
			{ status: 500 }
		);
	}
}
