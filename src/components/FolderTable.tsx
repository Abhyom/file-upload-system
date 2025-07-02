"use client";

import { FolderItem } from "@/types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Folder } from "lucide-react";

interface FolderTableProps {
	folders: FolderItem[];
	onNavigate: (folderId: string) => void;
}

export function FolderTable({ folders, onNavigate }: FolderTableProps) {
	if (folders.length === 0) return null;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[50px]"></TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Date Created</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{folders.map((folder) => (
					<TableRow
						key={folder.id}
						className="cursor-pointer hover:bg-gray-50"
						onClick={() => onNavigate(folder.id)}
					>
						<TableCell>
							<Folder className="h-6 w-6 text-blue-500" />
						</TableCell>
						<TableCell>{folder.name}</TableCell>
						<TableCell>
							{new Date(folder.createdAt).toLocaleDateString()}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
