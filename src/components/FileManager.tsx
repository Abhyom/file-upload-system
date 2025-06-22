"use client";

import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { FileUploader } from "./FileUploader";
import { FolderList } from "./FolderList";
import { FileList } from "./FileList";
import { Breadcrumb } from "./Breadcrumb";
import { FileItem, FolderItem } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function FileManager() {
	const [currentFolderId, setCurrentFolderId] = useState<string>("root");
	const [files, setFiles] = useState<FileItem[]>([]);
	const [folders, setFolders] = useState<FolderItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);

	const refreshContents = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`/api/files?folderId=${currentFolderId}`,
				{
					signal: AbortSignal.timeout(10000),
				}
			);
			if (!response.ok)
				throw new Error(
					`HTTP ${response.status}: ${await response.text()}`
				);
			const { files, folders } = await response.json();
			setFiles(files);
			setFolders(folders);
			setError(null);
			setRetryCount(0);
		} catch (error: any) {
			console.error("Error refreshing contents:", error.message);
			if (retryCount < 3) {
				setTimeout(() => setRetryCount(retryCount + 1), 2000);
			} else {
				setError(
					"Failed to load folder contents. Please check your connection."
				);
				toast.error("Failed to load folder contents");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		refreshContents();
	}, [currentFolderId, retryCount]);

	const handleFolderNavigate = (folderId: string) => {
		setCurrentFolderId(folderId);
		setRetryCount(0);
	};

	if (error) {
		return (
			<div className="max-w-6xl mx-auto p-6 text-center py-12 text-red-500">
				{error}
				<Button
					onClick={() => setRetryCount(retryCount + 1)}
					className="ml-4"
				>
					Retry
				</Button>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="max-w-6xl mx-auto p-6">
				<div className="text-center py-12">
					<p className="text-gray-500">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold text-gray-900">
					File Manager
				</h1>
				<div className="flex gap-2">
					<CreateFolderDialog
						currentFolderId={currentFolderId}
						onFolderCreated={refreshContents}
					/>
				</div>
			</div>

			<Breadcrumb
				currentFolderId={currentFolderId}
				onNavigate={handleFolderNavigate}
			/>

			<Separator />

			<FileUploader
				currentFolderId={currentFolderId}
				onFileUploaded={refreshContents}
			/>

			<Separator />

			{folders.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-lg font-semibold text-gray-900">
						Folders
					</h2>
					<FolderList
						folders={folders}
						onNavigate={handleFolderNavigate}
					/>
				</div>
			)}

			{files.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-lg font-semibold text-gray-900">
						Files
					</h2>
					<FileList files={files} onFileDeleted={refreshContents} />
				</div>
			)}

			{folders.length === 0 && files.length === 0 && (
				<div className="text-center py-12">
					<p className="text-gray-500">This folder is empty</p>
				</div>
			)}
		</div>
	);
}
