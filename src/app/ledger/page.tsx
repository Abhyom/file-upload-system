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
import { Fragment } from "react"; // Added import for Fragment

export default function Ledger() {
	const [logs, setLogs] = useState<FileLogItem[]>([]);
	const [filteredLogs, setFilteredLogs] = useState<FileLogItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);
	const [selectedType, setSelectedType] = useState<string | null>(null);
	const [expandedRows, setExpandedRows] = useState<string[]>([]); // Track expanded rows

	const documentTypes = ["resume", "report", "marksheet", "unknown"];

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
			setFilteredLogs(data); // Initialize with all logs
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

	useEffect(() => {
		if (selectedType === "unknown") {
			setFilteredLogs(logs.filter((log) => !log.documentType));
		} else if (selectedType) {
			setFilteredLogs(
				logs.filter((log) => log.documentType === selectedType)
			);
		} else {
			setFilteredLogs(logs);
		}
	}, [selectedType, logs]);

	const toggleRowExpansion = (id: string) => {
		setExpandedRows((prev) =>
			prev.includes(id)
				? prev.filter((rowId) => rowId !== id)
				: [...prev, id]
		);
	};

	const isFileNameLong = (fileName: string) => fileName.length > 30; // Adjust threshold as needed

	return (
		<main className="relative min-h-screen">
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
					<div className="flex justify-between items-center">
						<h1 className="text-3xl font-bold text-gray-900">
							File Activity Ledger
						</h1>
						<div className="space-x-2">
							<Badge
								variant={
									selectedType === null
										? "default"
										: "outline"
								}
								className="cursor-pointer h-8 rounded-xl border border-gray-400"
								onClick={() => setSelectedType(null)}
							>
								All
							</Badge>
							{documentTypes.map((type) => (
								<Badge
									key={type}
									variant={
										selectedType === type
											? "default"
											: "outline"
									}
									className="cursor-pointer capitalize p-2 rounded-full border border-gray-400"
									onClick={() => setSelectedType(type)}
								>
									{type}
								</Badge>
							))}
						</div>
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>File Name</TableHead>
								<TableHead>Size</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Context</TableHead>
								<TableHead>Action</TableHead>
								<TableHead>Timestamp</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredLogs.map((log) => (
								<Fragment key={log.id}>
									<TableRow>
										<TableCell>
											<div className="flex flex-col">
												<span
													className={
														isFileNameLong(
															log.fileName
														)
															? "truncate max-w-[200px]"
															: ""
													}
													title={log.fileName}
												>
													{log.fileName}
												</span>
												{isFileNameLong(
													log.fileName
												) && (
													<button
														className="text-sm text-blue-500 hover:underline text-left"
														onClick={() =>
															toggleRowExpansion(
																log.id
															)
														}
													>
														{expandedRows.includes(
															log.id
														)
															? "Read Less"
															: "Read More"}
													</button>
												)}
											</div>
										</TableCell>
										<TableCell>
											{formatFileSize(log.fileSize)}
										</TableCell>
										<TableCell>
											{formatFileType(log.mimeType)}
										</TableCell>
										<TableCell>
											{log.documentType ? (
												<Badge
													variant="secondary"
													className="capitalize bg-blue-50"
												>
													{log.documentType}
												</Badge>
											) : (
												<Badge variant="outline">
													Unknown
												</Badge>
											)}
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
									{expandedRows.includes(log.id) && (
										<TableRow>
											<TableCell
												colSpan={6}
												className="text-sm text-gray-600"
											>
												Full Name: {log.fileName}
											</TableCell>
										</TableRow>
									)}
								</Fragment>
							))}
						</TableBody>
					</Table>
					{filteredLogs.length === 0 && (
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
