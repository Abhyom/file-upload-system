"use client";

import { Folder } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FolderItem } from "@/types";

interface FolderListProps {
	folders: FolderItem[];
	onNavigate: (folderId: string) => void;
}

export function FolderList({ folders, onNavigate }: FolderListProps) {
	if (folders.length === 0) return null;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{folders.map((folder) => (
				<Card
					key={folder.id}
					className="p-4 hover:shadow-md transition-shadow cursor-pointer"
					onClick={() => onNavigate(folder.id)}
				>
					<div className="flex items-center space-x-3">
						<Folder className="h-8 w-8 text-blue-500" />
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{folder.name}
							</p>
							<p className="text-xs text-gray-500">
								{new Date(
									folder.createdAt
								).toLocaleDateString()}
							</p>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
