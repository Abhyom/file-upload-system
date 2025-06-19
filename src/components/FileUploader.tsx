"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { generateId } from "@/lib/fileUtils";
import { addFile, getCurrentFolder } from "@/lib/sessionStore";
import { FileItem } from "@/types";
import { toast } from "sonner";

interface FileUploaderProps {
	onFileUploaded: () => void;
}

export function FileUploader({ onFileUploaded }: FileUploaderProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

	const handleFileSelect = async (files: FileList) => {
		if (!files.length) return;

		setIsUploading(true);
		const currentFolder = getCurrentFolder();
		let successCount = 0;
		let errorCount = 0;

		for (const file of Array.from(files)) {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folderId", currentFolder?.id || "root");

			try {
				const response = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				if (response.ok) {
					const { filePath } = await response.json();

					const fileItem: FileItem = {
						id: generateId(),
						name: file.name,
						type: "file",
						size: file.size,
						mimeType: file.type,
						folderId: currentFolder?.id || "root",
						createdAt: new Date(),
						path: filePath,
					};

					addFile(fileItem);
					successCount++;
				} else {
					errorCount++;
				}
			} catch (error) {
				console.error("Upload failed:", error);
				errorCount++;
			}
		}

		// Show appropriate toast messages
		if (successCount > 0 && errorCount === 0) {
			toast.success(
				`${successCount} file${
					successCount > 1 ? "s" : ""
				} uploaded successfully`
			);
		} else if (successCount > 0 && errorCount > 0) {
			toast.warning(
				`${successCount} files uploaded, ${errorCount} failed`
			);
		} else if (errorCount > 0) {
			toast.error(
				`Failed to upload ${errorCount} file${
					errorCount > 1 ? "s" : ""
				}`
			);
		}

		setIsUploading(false);
		onFileUploaded();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const files = e.dataTransfer.files;
		handleFileSelect(files);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	return (
		<div className="space-y-4">
			<div
				className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
				<Upload className="mx-auto h-12 w-12 text-gray-400" />
				<p className="mt-2 text-sm text-gray-600">
					Drag and drop files here, or click to select files
				</p>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
				>
					{isUploading ? "Uploading..." : "Choose Files"}
				</Button>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				multiple
				className="hidden"
				onChange={(e) =>
					e.target.files && handleFileSelect(e.target.files)
				}
			/>
		</div>
	);
}
