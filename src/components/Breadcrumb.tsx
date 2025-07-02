// components/Breadcrumb.tsx
"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolderItem } from "@/types";
import { toast } from "sonner";

interface BreadcrumbProps {
	currentFolderId: string | null;
	onNavigate: (folderId: string) => void;
}

export function Breadcrumb({ currentFolderId, onNavigate }: BreadcrumbProps) {
	const [path, setPath] = useState<FolderItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);

	const loadPath = async () => {
		setLoading(true);
		try {
			if (currentFolderId === null) {
				setPath([
					{
						id: "root",
						name: "root",
						type: "folder",
						parentId: null,
						createdAt: new Date(),
					},
				]);
				setError(null);
				setRetryCount(0);
			} else {
				const response = await fetch(
					`/api/path?folderId=${currentFolderId}`,
					{
						signal: AbortSignal.timeout(10000),
					}
				);
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.error || `HTTP ${response.status}`
					);
				}
				const folderPath = await response.json();
				setPath([
					{
						id: "root",
						name: "root",
						type: "folder",
						parentId: null,
						createdAt: new Date(),
					},
					...folderPath,
				]);
				setError(null);
				setRetryCount(0);
			}
		} catch (error: any) {
			console.error("Error loading path:", error.message);
			if (retryCount < 3) {
				setTimeout(() => setRetryCount(retryCount + 1), 2000);
			} else {
				setError(
					"Failed to load breadcrumb. Please check your connection."
				);
				toast.error("Failed to load breadcrumb");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPath();
	}, [currentFolderId, retryCount]);

	if (error) {
		return (
			<div className="text-red-500 flex items-center">
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
		return <div className="text-gray-500">Loading breadcrumb...</div>;
	}

	return (
		<div className="flex items-center space-x-1 text-sm text-muted-foreground">
			{path.map((folder, index) => (
				<div
					key={`${folder.id}-${index}`}
					className="flex items-center"
				>
					{index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
					<Button
						variant="ghost"
						size="sm"
						className="p-1 h-auto font-medium text-foreground"
						onClick={() => onNavigate(folder.id)}
						disabled={index === path.length - 1}
					>
						{folder.id === "root" ? "/root" : folder.name}
					</Button>
				</div>
			))}
		</div>
	);
}
