"use client";

import { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, formatFileType } from "@/lib/fileUtils";
import { FileLogItem } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Ledger() {
	const [logs, setLogs] = useState<FileLogItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);

	const fetchLogs = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/logs", {
				signal: AbortSignal.timeout(10000),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `HTTP ${response.status}`);
			}
			const data = await response.json();
			setLogs(data);
			setError(null);
			setRetryCount(0);
		} catch (error: any) {
			console.error("Error fetching logs:", error.message);
			if (retryCount < 3) {
				setTimeout(() => setRetryCount(retryCount + 1), 2000);
			} else {
				setError(
					"Failed to load file logs. Please check your connection."
				);
				toast.error("Failed to load file logs");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs();
	}, [retryCount]);

	return (
		<main className="relative min-h-screen">
			{/* Soft Brown Grid Background */}
			<div className="absolute inset-0 -z-10 h-full w-full bg-[#FDF5E6] bg-[linear-gradient(to_right,#e6e6e6_1px,transparent_1px),linear-gradient(to_bottom,#e6e6e6_1px,transparent_1px)] bg-[size:6rem_4rem]" />

			{error ? (
				<div className="max-w-6xl mx-auto p-6 text-center py-12 text-red-500">
					{error}
					<Button
						onClick={() => setRetryCount(retryCount + 1)}
						className="ml-4"
					>
						Retry
					</Button>
				</div>
			) : loading ? (
				<div className="max-w-6xl mx-auto p-6">
					<div className="text-center py-12">
						<p className="text-gray-500">Loading...</p>
					</div>
				</div>
			) : (
				<div className="max-w-6xl mx-auto p-6 space-y-6">
					<h1 className="text-3xl font-bold text-gray-900">
						File Activity Ledger
					</h1>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>File Name</TableHead>
								<TableHead>Size</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Action</TableHead>
								<TableHead>Timestamp</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{logs.map((log) => (
								<TableRow key={log.id}>
									<TableCell>{log.fileName}</TableCell>
									<TableCell>
										{formatFileSize(log.fileSize)}
									</TableCell>
									<TableCell>
										{formatFileType(log.mimeType)}
									</TableCell>
									<TableCell>
										<Badge
											variant="default"
											className={
												log.action === "DELETED"
													? "bg-red-500 text-white"
													: "bg-green-400 text-black"
											}
										>
											{log.action}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(
											log.createdAt
										).toLocaleString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{logs.length === 0 && (
						<div className="text-center py-12">
							<p className="text-gray-500">
								No file activity recorded
							</p>
						</div>
					)}
				</div>
			)}
		</main>
	);
}
