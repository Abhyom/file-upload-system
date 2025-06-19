"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoredData, setCurrentFolder } from "@/lib/sessionStore";
import { FolderItem } from "@/types";

interface BreadcrumbProps {
	currentFolderId: string;
	onNavigate: () => void;
}

export function Breadcrumb({ currentFolderId, onNavigate }: BreadcrumbProps) {
	const data = getStoredData();

	const buildPath = (folderId: string): FolderItem[] => {
		const path: FolderItem[] = [];
		let current = data.folders.find((f) => f.id === folderId);

		while (current) {
			path.unshift(current);
			if (current.parentId) {
				current = data.folders.find((f) => f.id === current!.parentId);
			} else {
				break;
			}
		}

		return path;
	};

	const path = buildPath(currentFolderId);

	const handleNavigate = (folderId: string) => {
		setCurrentFolder(folderId);
		onNavigate();
	};

	return (
		<div className="flex items-center space-x-1 text-sm text-muted-foreground">
			{path.map((folder, index) => (
				<div key={folder.id} className="flex items-center">
					{index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
					<Button
						variant="ghost"
						size="sm"
						className="p-1 h-auto font-medium text-foreground"
						onClick={() => handleNavigate(folder.id)}
						disabled={index === path.length - 1}
					>
						{folder.id === "root" ? "/root" : folder.name}
					</Button>
				</div>
			))}
		</div>
	);
}
