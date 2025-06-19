export function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(mimeType: string): string {
	if (mimeType.startsWith("image/")) return "🖼️";
	if (mimeType.startsWith("video/")) return "🎥";
	if (mimeType.startsWith("audio/")) return "🎵";
	if (mimeType.includes("pdf")) return "📄";
	if (mimeType.includes("text/")) return "📝";
	if (mimeType.includes("zip") || mimeType.includes("rar")) return "📦";
	return "📄";
}
