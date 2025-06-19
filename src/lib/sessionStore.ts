import { DriveItem, FileItem, FolderItem } from "@/types";

const STORAGE_KEY = "drive-data";

export interface DriveData {
	files: FileItem[];
	folders: FolderItem[];
	currentFolderId: string | null;
}

export function getStoredData(): DriveData {
	if (typeof window === "undefined") {
		return { files: [], folders: [], currentFolderId: null };
	}

	const stored = sessionStorage.getItem(STORAGE_KEY);
	if (!stored) {
		const rootFolder: FolderItem = {
			id: "root",
			name: "root",
			type: "folder",
			parentId: null,
			createdAt: new Date(),
			children: [],
		};
		const initialData: DriveData = {
			files: [],
			folders: [rootFolder],
			currentFolderId: "root",
		};
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
		return initialData;
	}

	return JSON.parse(stored);
}

export function saveStoredData(data: DriveData): void {
	if (typeof window === "undefined") return;
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addFolder(folder: FolderItem): void {
	const data = getStoredData();
	data.folders.push(folder);

	// Add to parent's children
	if (folder.parentId) {
		const parent = data.folders.find((f) => f.id === folder.parentId);
		if (parent) {
			parent.children.push(folder.id);
		}
	}

	saveStoredData(data);
}

export function addFile(file: FileItem): void {
	const data = getStoredData();
	data.files.push(file);

	// Add to folder's children
	const folder = data.folders.find((f) => f.id === file.folderId);
	if (folder) {
		folder.children.push(file.id);
	}

	saveStoredData(data);
}

export function deleteFile(fileId: string): void {
	const data = getStoredData();

	// Remove file from files array
	const fileIndex = data.files.findIndex((f) => f.id === fileId);
	if (fileIndex !== -1) {
		const file = data.files[fileIndex];
		data.files.splice(fileIndex, 1);

		// Remove from folder's children
		const folder = data.folders.find((f) => f.id === file.folderId);
		if (folder) {
			folder.children = folder.children.filter((id) => id !== fileId);
		}

		saveStoredData(data);
	}
}

export function getCurrentFolder(): FolderItem | null {
	const data = getStoredData();
	return data.folders.find((f) => f.id === data.currentFolderId) || null;
}

export function setCurrentFolder(folderId: string): void {
	const data = getStoredData();
	data.currentFolderId = folderId;
	saveStoredData(data);
}

export function getFolderContents(folderId: string): {
	files: FileItem[];
	folders: FolderItem[];
} {
	const data = getStoredData();
	const folder = data.folders.find((f) => f.id === folderId);

	if (!folder) {
		return { files: [], folders: [] };
	}

	const files = data.files.filter((f) => f.folderId === folderId);
	const folders = data.folders.filter((f) => f.parentId === folderId);

	return { files, folders };
}
