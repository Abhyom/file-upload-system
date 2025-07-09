export interface FileItem {
	id: string;
	name: string;
	type: "file";
	size: number;
	mimeType: string;
	folderId: string;
	createdAt: Date;
	path: string;
}

export interface FolderItem {
	id: string;
	name: string;
	type: "folder";
	parentId: string | null;
	createdAt: Date;
	children?: string[];
}

export interface FileLogItem {
	id: string;
	fileId: string | null;
	fileName: string;
	fileSize: number;
	mimeType: string;
	action: string;
	createdAt: Date;
}

export type DriveItem = FileItem | FolderItem;
