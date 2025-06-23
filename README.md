# File Upload System

A lightweight file manager built with **Next.js**, **Prisma (SQLite)**, and **Tailwind CSS** using **shadcn UI** components.

Users can:
- Create nested folders
- Upload, download, and delete files
- Navigate folder structures

All data is stored in `dev.db` (SQLite), and files are saved in `public/uploads`. The application has no authentication as of yet and uses a single root folder (`id: "root"`).

---

## Features

- Drag-and-drop file uploads
- Folder hierarchy and navigation
- File metadata handling
- SQLite-backed storage
- Toast-based error handling

---

## Application Flow

1. **Entry Point**: The app loads and renders the `FileManager` component.
2. **Initialization**: On first load, `initializeDatabase` (via `/api/files`) creates a root folder (`id: "root"`) in `dev.db` if it doesn’t exist.
3. **Dashboard Display**: `FileManager` fetches folder contents via `/api/files` for the current folder (default: root).
4. **Navigation**: Clicking a folder in `FolderList` updates the current `folderId`. `Breadcrumb` fetches the path using `/api/path`.
5. **Folder Creation**: `CreateFolderDialog` posts to `/api/folder` to add a new folder in `dev.db`.
6. **File Upload**: `FileUploader` posts to `/api/upload`; files are saved to `public/uploads` and metadata is saved in `dev.db`.
7. **File Deletion**: `FileList` uses `/api/delete` to remove files from both disk and database.
8. **File Download**: Direct access through `/uploads/<filename>`.
9. **Error Handling**: API calls include timeouts and retries (up to 3); errors are shown via toast or inline UI.

---

## API Routes (`src/app/api`)

- `delete/route.ts`: POST — deletes a file by `fileId` from disk and DB
- `files/route.ts`: GET — fetches folders/files (default: `root`)
- `folder/route.ts`: POST — creates a folder with `name` and `parentId`
- `path/route.ts`: GET — retrieves folder path for breadcrumbs
- `upload/route.ts`: POST — handles file uploads (up to 10MB)

---

## UI Components (`src/components`)

- `Breadcrumb.tsx`: Shows navigable folder path via `/api/path`
- `FileList.tsx`: Lists files with metadata and actions (download, delete)
- `FolderList.tsx`: Clickable folder cards
- `FileUploader.tsx`: Upload interface with toast notifications
- `CreateFolderDialog.tsx`: Input dialog to add new folders
- `FileManager.tsx`: Main UI logic, state manager, and layout renderer

---

