"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";

interface CreateFolderDialogProps {
	currentFolderId: string;
	onFolderCreated: () => void;
}

export function CreateFolderDialog({
	currentFolderId,
	onFolderCreated,
}: CreateFolderDialogProps) {
	const [open, setOpen] = useState(false);
	const [folderName, setFolderName] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const handleCreate = async () => {
		if (!folderName.trim()) {
			toast.error("Please enter a folder name");
			return;
		}

		setIsCreating(true);

		try {
			const response = await fetch("/api/folder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: folderName.trim(),
					parentId: currentFolderId,
				}),
				signal: AbortSignal.timeout(10000),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to create folder");
			}

			toast.success(`Folder "${folderName}" created successfully`);
			setFolderName("");
			setOpen(false);
			onFolderCreated();
		} catch (error: any) {
			console.error("Error creating folder:", error.message);
			toast.error(`Failed to create folder: ${error.message}`);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<FolderPlus className="h-4 w-4" />
					New Folder
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Folder</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<Input
						placeholder="Folder name"
						value={folderName}
						onChange={(e) => setFolderName(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleCreate()}
					/>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreate}
							disabled={!folderName.trim() || isCreating}
						>
							{isCreating ? "Creating..." : "Create"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
