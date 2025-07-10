"use client";

import { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
	currentFolderId: string | null;
	onFileUploaded: () => void;
}

export interface FileUploaderHandle {
	triggerFileInput: () => void;
}

export const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>(
	({ currentFolderId, onFileUploaded }, ref) => {
		const fileInputRef = useRef<HTMLInputElement>(null);
		const [isUploading, setIsUploading] = useState(false);

		useImperativeHandle(ref, () => ({
			triggerFileInput: () => {
				fileInputRef.current?.click();
			},
		}));

		const handleFileSelect = async (files: FileList) => {
			if (!files.length) return;

			if (currentFolderId === null) {
				toast.error("Cannot upload files to root folder");
				return;
			}

			setIsUploading(true);
			let successCount = 0;
			let errorCount = 0;
			let warningCount = 0;

			for (const file of Array.from(files)) {
				const formData = new FormData();
				formData.append("file", file);
				formData.append("folderId", currentFolderId);

				try {
					const response = await fetch("/api/upload", {
						method: "POST",
						body: formData,
						signal: AbortSignal.timeout(180000), // 180 seconds
					});

					const data = await response.json();

					if (!response.ok) {
						throw new Error(
							data.error || `HTTP ${response.status}`
						);
					}

					successCount++;
					if (data.warning) {
						warningCount++;
						toast.warning(
							`Warning for ${file.name}: ${data.warning}`
						);
					}
				} catch (error: any) {
					console.error("Upload failed:", error.message);
					if (error.name === "TimeoutError") {
						// Check if the file was actually uploaded
						try {
							const filesResponse = await fetch(
								`/api/files?folderId=${currentFolderId}`,
								{ signal: AbortSignal.timeout(10000) }
							);
							const { files: uploadedFiles } =
								await filesResponse.json();
							const fileUploaded = uploadedFiles.some(
								(f: any) => f.name === file.name
							);
							if (fileUploaded) {
								successCount++;
								toast.warning(
									`File ${file.name} uploaded but took longer than expected`
								);
							} else {
								errorCount++;
								toast.error(
									`Failed to upload ${file.name}: ${error.message}`
								);
							}
						} catch (checkError: any) {
							errorCount++;
							toast.error(
								`Failed to upload ${file.name}: ${error.message}`
							);
						}
					} else {
						errorCount++;
						toast.error(
							`Failed to upload ${file.name}: ${error.message}`
						);
					}
				}
			}

			if (successCount > 0 && errorCount === 0 && warningCount === 0) {
				toast.success(
					`${successCount} file${
						successCount > 1 ? "s" : ""
					} uploaded successfully`
				);
			} else if (successCount > 0 && errorCount > 0) {
				toast.warning(
					`${successCount} files uploaded, ${errorCount} failed`
				);
			} else if (errorCount > 0 && successCount === 0) {
				toast.error(
					`Failed to upload ${errorCount} file${
						errorCount > 1 ? "s" : ""
					}`
				);
			}

			if (warningCount > 0) {
				toast.warning(
					`${warningCount} file${
						warningCount > 1 ? "s" : ""
					} may be scanned PDFs. Check warnings for details.`
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

		if (currentFolderId === null) return null;

		return (
			<div className="space-y-4">
				<div
					className="border-2 border-dashed border-black rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				>
					<Upload className="mx-auto h-12 w-12 text-gray-400" />
					<p className="mt-2 text-sm text-gray-600">
						Drag and drop files here, or click to select files
					</p>
					<Button
						variant="outline"
						className="mt-4 border border-gray-400"
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}
					>
						{isUploading ? "Uploading..." : "Choose Files"}
					</Button>
					{isUploading && (
						<p className="mt-2 text-sm text-gray-600 flex items-center justify-center">
							<svg
								className="animate-spin h-5 w-5 mr-2 text-gray-600"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Extracting text from file...
						</p>
					)}
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
);

FileUploader.displayName = "FileUploader";
