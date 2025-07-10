import pdf from "pdf-parse";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
	try {
		const data = await pdf(buffer);
		const text = data.text || "";
		console.log("Extracted text:", text); // Debug log for extracted text
		return text;
	} catch (error) {
		console.error("PDF text extraction error:", error);
		return "";
	}
}
