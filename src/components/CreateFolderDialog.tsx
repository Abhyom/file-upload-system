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
import { generateId } from "@/lib/fileUtils";
import { addFolder, getCurrentFolder } from "@/lib/sessionStore";
import { FolderItem } from "@/types";
import { toast } from "sonner";

interface CreateFolderDialogProps {
	onFolderCreated: () => void;
}

export function CreateFolderDialog({
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
		const currentFolder = getCurrentFolder();

		const newFolder: FolderItem = {
			id: generateId(),
			name: folderName.trim(),
			type: "folder",
			parentId: currentFolder?.id || "root",
			createdAt: new Date(),
			children: [],
		};

		addFolder(newFolder);
		toast.success(`Folder "${folderName}" created successfully`);

		setFolderName("");
		setOpen(false);
		setIsCreating(false);
		onFolderCreated();
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
							Create
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
