# File Upload System

A lightweight file manager built with **Next.js**, **Prisma (SQLite)**, and **Tailwind CSS** using **shadcn UI** components.




All metadata is stored in `dev.db` (SQLite), and files are saved in `public/uploads`.
---

## Directory Organization 

- Homepage as /root Directory: The homepage of the application is designed to represent the /root directory, which serves as the global drive or root level of the file management system.

  ![image](https://github.com/user-attachments/assets/b1e61f03-2d8c-46cc-a751-7255fa9eadd2)

- No File Storage at /root: Files cannot be stored directly in the /root directory to maintain a clean and organized structure, preventing clutter at the top level.
- Home Folder Presence: The homepage displays a single "home" folder under the /root directory, which acts as the primary location for user activities.
- User Actions in Home Folder: Within the "home" folder, users can upload files, create new folders, delete existing files or folders, and perform other file management tasks.

  ![image](https://github.com/user-attachments/assets/99fa7fca-34aa-4fba-ac93-ad9679826807)
  
- Navigation and Functionality: Clicking the "home" folder from the /root homepage navigates users into the "home" directory, where all file and folder operations are enabled, while the /root remains a read-only overview.

## Features

- Table and Grid view

  ![image](https://github.com/user-attachments/assets/c5601d89-9614-40fc-b03c-f893e9645580)
  ![image](https://github.com/user-attachments/assets/484439a2-114b-4db4-89c5-b2ed56b806d4)

- Drag and drop files for upload

- Folder hierarchy and navigation - The /root directory features a "home" folder for user actions, navigated via Prisma with an M:M relation for efficient management.
- Delete previously uploaded files
- Download uploaded files
- Metadata of uploaded files stored in SQLite-backed storage

  ![image](https://github.com/user-attachments/assets/bde5f550-f4a6-4a10-92c5-0752fafc685a)


- Toast-based error handling

  ![image](https://github.com/user-attachments/assets/8bd60b45-445b-4770-bbf6-ba500f87cd91)


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
- `FileUploader.tsx`: Upload interface with toast notifications
- `CreateFolderDialog.tsx`: Input dialog to add new folders
- `FileManager.tsx`: Main UI logic, state manager, and layout renderer contains clickable folder cards and files with metadata and actions (download, delete)
---

