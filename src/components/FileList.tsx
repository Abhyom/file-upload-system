// components/FileList.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { FileItem } from "@/types";
import { formatFileSize, getFileIcon, formatFileType } from "@/lib/fileUtils";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";

interface FileListProps {
	files: FileItem[];
	onFileDeleted?: () => void;
	isListView?: boolean;
}

export function FileList({
	files,
	onFileDeleted,
	isListView = false,
}: FileListProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

	const handleDelete = async (file: FileItem) => {
		setFileToDelete(file);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!fileToDelete) return;

		try {
			const response = await fetch("/api/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ fileId: fileToDelete.id }),
				signal: AbortSignal.timeout(10000),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `HTTP ${response.status}`);
			}

			toast.success(`File "${fileToDelete.name}" deleted successfully`);
			onFileDeleted?.();
		} catch (error: any) {
			console.error("Delete failed:", error.message);
			toast.error(
				`Failed to delete file "${fileToDelete.name}": ${error.message}`
			);
		} finally {
			setDeleteDialogOpen(false);
			setFileToDelete(null);
		}
	};

	if (files.length === 0) return null;

	return (
		<>
			{isListView ? (
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
						{files.map((file) => (
							<TableRow key={file.id}>
								<TableCell>
									{getFileIcon(file.mimeType)}
								</TableCell>
								<TableCell>{file.name}</TableCell>
								<TableCell>
									{formatFileType(file.mimeType)}
								</TableCell>
								<TableCell>
									{formatFileSize(file.size)}
								</TableCell>
								<TableCell>
									{new Date(
										file.createdAt
									).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<div className="flex space-x-2">
										<a href={file.path} download>
											<Button variant="ghost" size="sm">
												<Download className="h-4 w-4" />
											</Button>
										</a>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(file)}
										>
											<Trash2 className="h-4 w-4 text-red-500" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			) : (
				<div className="space-y-2">
					{files.map((file) => (
						<Card
							key={file.id}
							className="p-4 hover:shadow-md transition-shadow"
						>
							<div className="flex items-center space-x-3">
								<div className="text-2xl">
									{getFileIcon(file.mimeType)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 truncate">
										{file.name}
									</p>
									<p className="text-xs text-gray-500">
										{formatFileType(file.mimeType)} •{" "}
										{formatFileSize(file.size)} •{" "}
										{new Date(
											file.createdAt
										).toLocaleDateString()}
									</p>
								</div>
								<div className="flex space-x-2">
									<a href={file.path} download>
										<Button variant="ghost" size="sm">
											<Download className="h-4 w-4" />
										</Button>
									</a>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleDelete(file)}
									>
										<Trash2 className="h-4 w-4 text-red-500" />
									</Button>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete File</DialogTitle>
					</DialogHeader>
					<p>
						Are you sure you want to delete "{fileToDelete?.name}"?
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
		</>
	);
}
