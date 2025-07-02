// components/FileManager.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { FileUploader, FileUploaderHandle } from "./FileUploader";
import { FolderList } from "./FolderList";
import { FolderTable } from "./FolderTable";
import { FileList } from "./FileList";
import { Breadcrumb } from "./Breadcrumb";
import { FileItem, FolderItem } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { Grid, List } from "lucide-react";
import { formatFileSize, getFileIcon, formatFileType } from "@/lib/fileUtils";
import { Download, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function FileManager() {
	const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
	const [files, setFiles] = useState<FileItem[]>([]);
	const [folders, setFolders] = useState<FolderItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const fileUploaderRef = useRef<FileUploaderHandle>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null);

	const refreshContents = async (folderId: string) => {
		setLoading(true);
		try {
			const response = await fetch(`/api/files?folderId=${folderId}`, {
				signal: AbortSignal.timeout(10000),
			});
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
		if (currentFolderId) {
			refreshContents(currentFolderId);
		} else {
			// Initially show home folder
			setFolders([
				{
					id: "home",
					name: "home",
					type: "folder",
					parentId: null,
					createdAt: new Date(),
					children: [],
				},
			]);
			setFiles([]);
			setLoading(false);
		}
	}, [currentFolderId, retryCount]);

	const handleFolderNavigate = (folderId: string) => {
		setCurrentFolderId(folderId === "root" ? null : folderId);
		setRetryCount(0);
	};

	const toggleViewMode = () => {
		setViewMode(viewMode === "grid" ? "list" : "grid");
	};

	const handleDelete = async (file: FileItem) => {
		setItemToDelete(file);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!itemToDelete) return;

		try {
			const response = await fetch("/api/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ fileId: itemToDelete.id }),
				signal: AbortSignal.timeout(10000),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `HTTP ${response.status}`);
			}

			toast.success(`File "${itemToDelete.name}" deleted successfully`);
			refreshContents(currentFolderId || "home");
		} catch (error: any) {
			console.error("Delete failed:", error.message);
			toast.error(
				`Failed to delete file "${itemToDelete.name}": ${error.message}`
			);
		} finally {
			setDeleteDialogOpen(false);
			setItemToDelete(null);
		}
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

	if (!currentFolderId) {
		return (
			<div className="max-w-6xl mx-auto p-6 space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold text-gray-900">
						File Manager
					</h1>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={toggleViewMode}
							aria-label={
								viewMode === "grid"
									? "Switch to list view"
									: "Switch to grid view"
							}
						>
							{viewMode === "grid" ? (
								<List className="h-4 w-4" />
							) : (
								<Grid className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>

				<Breadcrumb
					currentFolderId={currentFolderId}
					onNavigate={handleFolderNavigate}
				/>

				<Separator />

				<div className="space-y-4">
					<h2 className="text-lg font-semibold text-gray-900">
						Contents
					</h2>
					{viewMode === "grid" ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{[...folders, ...files].map((item) =>
								item.type === "folder" ? (
									<Card
										key={item.id}
										className="p-4 hover:shadow-md transition-shadow cursor-pointer"
										onClick={() =>
											handleFolderNavigate(item.id)
										}
									>
										<div className="flex items-center space-x-3">
											<Folder className="h-8 w-8 text-blue-500" />
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-gray-900 truncate">
													{item.name}
												</p>
												<p className="text-xs text-gray-500">
													{new Date(
														item.createdAt
													).toLocaleDateString()}
												</p>
											</div>
										</div>
									</Card>
								) : (
									<Card
										key={item.id}
										className="p-4 hover:shadow-md transition-shadow"
									>
										<div className="flex items-center space-x-3">
											<div className="text-2xl">
												{getFileIcon(item.mimeType)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-gray-900 truncate">
													{item.name}
												</p>
												<p className="text-xs text-gray-500">
													{formatFileType(
														item.mimeType
													)}{" "}
													•{" "}
													{formatFileSize(item.size)}{" "}
													•{" "}
													{new Date(
														item.createdAt
													).toLocaleDateString()}
												</p>
											</div>
											<div className="flex space-x-2">
												<a href={item.path} download>
													<Button
														variant="ghost"
														size="sm"
													>
														<Download className="h-4 w-4" />
													</Button>
												</a>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														handleDelete(item)
													}
												>
													<Trash2 className="h-4 w-4 text-red-500" />
												</Button>
											</div>
										</div>
									</Card>
								)
							)}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]"></TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Size</TableHead>
									<TableHead>Date Created</TableHead>
									<TableHead className="w-[100px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{[...folders, ...files].map((item) => (
									<TableRow
										key={item.id}
										className={
											item.type === "folder"
												? "cursor-pointer hover:bg-gray-50"
												: ""
										}
										onClick={
											item.type === "folder"
												? () =>
														handleFolderNavigate(
															item.id
														)
												: undefined
										}
									>
										<TableCell>
											{item.type === "folder" ? (
												<Folder className="h-6 w-6 text-blue-500" />
											) : (
												getFileIcon(item.mimeType)
											)}
										</TableCell>
										<TableCell>{item.name}</TableCell>
										<TableCell>
											{item.type === "folder"
												? "Folder"
												: formatFileType(item.mimeType)}
										</TableCell>
										<TableCell>
											{item.type === "folder"
												? "-"
												: formatFileSize(item.size)}
										</TableCell>
										<TableCell>
											{new Date(
												item.createdAt
											).toLocaleDateString()}
										</TableCell>
										<TableCell>
											{item.type === "file" && (
												<div className="flex space-x-2">
													<a
														href={item.path}
														download
													>
														<Button
															variant="ghost"
															size="sm"
														>
															<Download className="h-4 w-4" />
														</Button>
													</a>
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															handleDelete(item)
														}
													>
														<Trash2 className="h-4 w-4 text-red-500" />
													</Button>
												</div>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
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
					<Button
						variant="outline"
						size="icon"
						onClick={toggleViewMode}
						aria-label={
							viewMode === "grid"
								? "Switch to list view"
								: "Switch to grid view"
						}
					>
						{viewMode === "grid" ? (
							<List className="h-4 w-4" />
						) : (
							<Grid className="h-4 w-4" />
						)}
					</Button>
					<CreateFolderDialog
						currentFolderId={currentFolderId}
						onFolderCreated={() => refreshContents(currentFolderId)}
					/>
				</div>
			</div>

			<Breadcrumb
				currentFolderId={currentFolderId}
				onNavigate={handleFolderNavigate}
			/>

			<Separator />

			<FileUploader
				ref={fileUploaderRef}
				currentFolderId={currentFolderId}
				onFileUploaded={() => refreshContents(currentFolderId)}
			/>

			<Separator />

			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-gray-900">
					Contents
				</h2>
				{viewMode === "grid" ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{[...folders, ...files].map((item) =>
							item.type === "folder" ? (
								<Card
									key={item.id}
									className="p-4 hover:shadow-md transition-shadow cursor-pointer"
									onClick={() =>
										handleFolderNavigate(item.id)
									}
								>
									<div className="flex items-center space-x-3">
										<Folder className="h-8 w-8 text-blue-500" />
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">
												{item.name}
											</p>
											<p className="text-xs text-gray-500">
												{new Date(
													item.createdAt
												).toLocaleDateString()}
											</p>
										</div>
									</div>
								</Card>
							) : (
								<Card
									key={item.id}
									className="p-4 hover:shadow-md transition-shadow"
								>
									<div className="flex items-center space-x-3">
										<div className="text-2xl">
											{getFileIcon(item.mimeType)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">
												{item.name}
											</p>
											<p className="text-xs text-gray-500">
												{formatFileType(item.mimeType)}{" "}
												• {formatFileSize(item.size)} •{" "}
												{new Date(
													item.createdAt
												).toLocaleDateString()}
											</p>
										</div>
										<div className="flex space-x-2">
											<a href={item.path} download>
												<Button
													variant="ghost"
													size="sm"
												>
													<Download className="h-4 w-4" />
												</Button>
											</a>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													handleDelete(item)
												}
											>
												<Trash2 className="h-4 w-4 text-red-500" />
											</Button>
										</div>
									</div>
								</Card>
							)
						)}
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[50px]"></TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Size</TableHead>
								<TableHead>Date Created</TableHead>
								<TableHead className="w-[100px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{[...folders, ...files].map((item) => (
								<TableRow
									key={item.id}
									className={
										item.type === "folder"
											? "cursor-pointer hover:bg-gray-50"
											: ""
									}
									onClick={
										item.type === "folder"
											? () =>
													handleFolderNavigate(
														item.id
													)
											: undefined
									}
								>
									<TableCell>
										{item.type === "folder" ? (
											<Folder className="h-6 w-6 text-blue-500" />
										) : (
											getFileIcon(item.mimeType)
										)}
									</TableCell>
									<TableCell>{item.name}</TableCell>
									<TableCell>
										{item.type === "folder"
											? "Folder"
											: formatFileType(item.mimeType)}
									</TableCell>
									<TableCell>
										{item.type === "folder"
											? "-"
											: formatFileSize(item.size)}
									</TableCell>
									<TableCell>
										{new Date(
											item.createdAt
										).toLocaleDateString()}
									</TableCell>
									<TableCell>
										{item.type === "file" && (
											<div className="flex space-x-2">
												<a href={item.path} download>
													<Button
														variant="ghost"
														size="sm"
													>
														<Download className="h-4 w-4" />
													</Button>
												</a>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														handleDelete(item)
													}
												>
													<Trash2 className="h-4 w-4 text-red-500" />
												</Button>
											</div>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>

			{folders.length === 0 && files.length === 0 && (
				<div className="text-center py-12">
					<p className="text-gray-500">This folder is empty</p>
					<div className="mt-4 flex justify-center gap-4">
						<CreateFolderDialog
							currentFolderId={currentFolderId}
							onFolderCreated={() =>
								refreshContents(currentFolderId)
							}
						/>
						<Button
							variant="outline"
							onClick={() =>
								fileUploaderRef.current?.triggerFileInput()
							}
						>
							Upload Files
						</Button>
					</div>
				</div>
			)}

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete File</DialogTitle>
					</DialogHeader>
					<p>
						Are you sure you want to delete "{itemToDelete?.name}"?
						This action cannot be undone.
					</p>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={confirmDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
