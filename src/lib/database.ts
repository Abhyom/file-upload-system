import { prisma } from "./db";
import { FileItem, FolderItem } from "@/types";

export async function initializeDatabase() {
	try {
		const rootFolder = await prisma.folder.findFirst({
			where: { id: "root" },
		});

		if (!rootFolder) {
			await prisma.folder.create({
				data: {
					id: "root",
					name: "root",
					parentId: null,
				},
			});
			console.log("Root folder created");
		}
	} catch (error) {
		console.error("Error initializing database:", error);
		throw error;
	}
}

export async function createFolder(
	name: string,
	parentId: string
): Promise<FolderItem> {
	try {
		const folder = await prisma.folder.create({
			data: {
				name,
				parentId: parentId === "root" ? "root" : parentId,
			},
		});

		return {
			id: folder.id,
			name: folder.name,
			type: "folder",
			parentId: folder.parentId,
			createdAt: folder.createdAt,
			children: [],
		};
	} catch (error) {
		console.error("Error creating folder:", error);
		throw new Error("Failed to create folder");
	}
}

export async function createFile(
	fileData: Omit<FileItem, "id" | "type" | "createdAt">
): Promise<FileItem> {
	try {
		const file = await prisma.file.create({
			data: {
				name: fileData.name,
				size: fileData.size,
				mimeType: fileData.mimeType,
				path: fileData.path,
				folderId: fileData.folderId,
			},
		});

		return {
			id: file.id,
			name: file.name,
			type: "file",
			size: file.size,
			mimeType: file.mimeType,
			folderId: file.folderId,
			createdAt: file.createdAt,
			path: file.path,
		};
	} catch (error) {
		console.error("Error creating file:", error);
		throw new Error("Failed to create file");
	}
}

export async function getFolderContents(folderId: string) {
	try {
		const [folders, files] = await Promise.all([
			prisma.folder.findMany({
				where: { parentId: folderId },
				orderBy: { name: "asc" },
			}),
			prisma.file.findMany({
				where: { folderId },
				orderBy: { name: "asc" },
			}),
		]);

		return {
			folders: folders.map((f) => ({
				id: f.id,
				name: f.name,
				type: "folder" as const,
				parentId: f.parentId,
				createdAt: f.createdAt,
				children: [],
			})),
			files: files.map((f) => ({
				id: f.id,
				name: f.name,
				type: "file" as const,
				size: f.size,
				mimeType: f.mimeType,
				folderId: f.folderId,
				createdAt: f.createdAt,
				path: f.path,
			})),
		};
	} catch (error) {
		console.error("Error getting folder contents:", error);
		throw new Error("Failed to get folder contents");
	}
}

export async function getFolderPath(folderId: string): Promise<FolderItem[]> {
	try {
		const path: FolderItem[] = [];
		let currentId = folderId;

		while (currentId) {
			const folder = await prisma.folder.findUnique({
				where: { id: currentId },
			});

			if (folder) {
				path.unshift({
					id: folder.id,
					name: folder.name,
					type: "folder",
					parentId: folder.parentId,
					createdAt: folder.createdAt,
					children: [],
				});
				currentId = folder.parentId;
			} else {
				break;
			}
		}

		return path;
	} catch (error) {
		console.error("Error getting folder path:", error);
		throw new Error("Failed to get folder path");
	}
}

export async function deleteFile(fileId: string): Promise<void> {
	try {
		await prisma.file.delete({
			where: { id: fileId },
		});
	} catch (error) {
		console.error("Error deleting file:", error);
		throw new Error("Failed to delete file");
	}
}

export async function getFileById(fileId: string): Promise<FileItem | null> {
	try {
		const file = await prisma.file.findUnique({
			where: { id: fileId },
		});

		if (!file) return null;

		return {
			id: file.id,
			name: file.name,
			type: "file",
			size: file.size,
			mimeType: file.mimeType,
			folderId: file.folderId,
			createdAt: file.createdAt,
			path: file.path,
		};
	} catch (error) {
		console.error("Error getting file by ID:", error);
		throw new Error("Failed to get file");
	}
}
