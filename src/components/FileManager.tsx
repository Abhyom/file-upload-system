"use client";

import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { FileUploader } from "./FileUploader";
import { FolderList } from "./FolderList";
import { FileList } from "./FileList";
import { Breadcrumb } from "./Breadcrumb";
import { getFolderContents, getStoredData } from "@/lib/sessionStore";

export function FileManager() {
	const [currentFolderId, setCurrentFolderId] = useState<string>("root");
	const [files, setFiles] = useState<any[]>([]);
	const [folders, setFolders] = useState<any[]>([]);

	const refreshContents = () => {
		const data = getStoredData();
		setCurrentFolderId(data.currentFolderId || "root");
		const contents = getFolderContents(data.currentFolderId || "root");
		setFiles(contents.files);
		setFolders(contents.folders);
	};

	useEffect(() => {
		refreshContents();
	}, []);

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold text-gray-900">
					File Manager
				</h1>
				<div className="flex gap-2">
					<CreateFolderDialog onFolderCreated={refreshContents} />
				</div>
			</div>

			<Breadcrumb
				currentFolderId={currentFolderId}
				onNavigate={refreshContents}
			/>

			<Separator />

			<FileUploader onFileUploaded={refreshContents} />

			<Separator />

			{folders.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-lg font-semibold text-gray-900">
						Folders
					</h2>
					<FolderList
						folders={folders}
						onNavigate={refreshContents}
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
