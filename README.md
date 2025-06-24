# File Upload System

A lightweight file manager built with **Next.js**, **Prisma (SQLite)**, and **Tailwind CSS** using **shadcn UI** components.

![image](https://github.com/user-attachments/assets/a6058210-0073-464a-b3a8-7fb0caac0302)

All data is stored in `dev.db` (SQLite), and files are saved in `public/uploads`. The application has no authentication as of yet and uses a single root folder (`id: "root"`).

---

## Features

- Drag-and-drop file uploads

  

https://github.com/user-attachments/assets/b3a08da4-a45c-4111-acb8-e4f72fd23a3c





- Folder hierarchy and navigation

 


https://github.com/user-attachments/assets/dfa03008-2cde-4681-abe8-412f03c1beb9




- Create nested Folders

   

https://github.com/user-attachments/assets/19a37255-fe7a-45d2-936c-6234cabc56a9



  
- Delete previously uploaded files

     


https://github.com/user-attachments/assets/5ab55c81-0249-4565-b032-432592293709



- Download uploaded files

    

https://github.com/user-attachments/assets/9cbdd5e2-cfe1-43ba-87f5-8f3f7c4cec43




-  SQLite-backed storage

  ![image](https://github.com/user-attachments/assets/bde5f550-f4a6-4a10-92c5-0752fafc685a)


- Toast-based error handling

  ![image](https://github.com/user-attachments/assets/8bd60b45-445b-4770-bbf6-ba500f87cd91)


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

