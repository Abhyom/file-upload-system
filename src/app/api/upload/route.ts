import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { generateId } from "@/lib/fileUtils";
import { createFile } from "@/lib/database";
import { extractTextFromPDF } from "@/lib/ocr";
import OpenAI from "openai";

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

		// Perform text extraction and classification if the file is a PDF
		let documentType: string | null = null;
		let extractionWarning: string | null = null;
		if (file.type === "application/pdf") {
			try {
				const text = await extractTextFromPDF(buffer);
				if (!text) {
					extractionWarning =
						"Could not extract text from PDF. It may be scanned or image-based. Please ensure the PDF contains selectable text or use an OCR tool.";
				} else {
					// Call DeepSeek-R1 to classify the document
					const openai = new OpenAI({
						baseURL: "https://openrouter.ai/api/v1",
						apiKey: process.env.OPENROUTER_API_KEY,
					});

					const completion = await openai.chat.completions.create({
						model: "deepseek/deepseek-r1:free",
						messages: [
							{
								role: "system",
								content:
									"You are a document classification assistant. Analyze the provided text and determine the document type. Return the type of document based on the context of its text content for example:- 'resume', 'report', 'transaction record', 'Marksheet'. If text context is unavailable provide unknown as the type. Respond with only the document type as plain text.",
							},
							{
								role: "user",
								content: `Classify the following document text:\n\n${text.slice(
									0,
									10000
								)}`, // Limit text to avoid token limits
							},
						],
					});

					documentType =
						completion.choices[0].message.content || "unknown";
					console.log(
						`File: ${file.name}, Detected document type: ${documentType}`
					);
				}
			} catch (error: any) {
				console.error(
					`Text extraction or classification failed for ${file.name}:`,
					error.message
				);
				extractionWarning =
					"Text extraction or classification failed. Please ensure the PDF is text-based or try again.";
			}
		}

		const fileData = await createFile({
			name: file.name,
			size: file.size,
			mimeType: file.type,
			path: `/uploads/${filename}`,
			folderId: folderId,
			documentType, // Include document type
		});

		return NextResponse.json({
			message: "File uploaded successfully",
			filePath: `/uploads/${filename}`,
			documentType: fileData.documentType,
			warning: extractionWarning,
		});
	} catch (error: any) {
		console.error(`Upload error for file: ${error.message}`);
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
