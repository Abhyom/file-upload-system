# File Upload System

A lightweight file management platform(file uploader+ ledger) built with **Next.js**, **Prisma (SQLite)**, and **Tailwind CSS** using **shadcn UI** components.




All metadata is stored in `dev.db` (SQLite), and files are saved in `public/uploads`.
---

## Directory Organization 

- Homepage as /root Directory: The homepage of the application is designed to represent the /root directory, which serves as the global drive or root level of the file management system.

  <img width="1846" height="963" alt="image" src="https://github.com/user-attachments/assets/af671130-9fdd-4b22-9628-94f434ff5ec9" />


- No File Storage at /root: Files cannot be stored directly in the /root directory to maintain a clean and organized structure, preventing clutter at the top level.
- Home Folder Presence: The homepage displays a single "home" folder under the /root directory, which acts as the primary location for user activities.
- User Actions in Home Folder: Within the "home" folder, users can upload files, create new folders, delete existing files or folders, and perform other file management tasks.

  <img width="1848" height="960" alt="image" src="https://github.com/user-attachments/assets/32aba122-d9f1-445b-953e-d7d6dbd94359" />

  
- Navigation and Functionality: Clicking the "home" folder from the /root homepage navigates users into the "home" directory, where all file and folder operations are enabled, while the /root remains a read-only overview.

## Features

- Table and Grid view

  <img width="1844" height="964" alt="image" src="https://github.com/user-attachments/assets/d26caf4d-ade6-4fbb-a6e4-21fd103e12b5" />

- Deepseek AI + pdf-parse OCR powered context based Ledger for text extraction automatic file logging

<img width="1850" height="965" alt="image" src="https://github.com/user-attachments/assets/4f05198f-fbc6-4c1b-aca2-6d12cbe275a5" />

  
- Drag and drop files for upload

- Folder hierarchy and navigation - The /root directory features a "home" folder for user actions, navigated via Prisma with an M:M relation for efficient management.
- Delete previously uploaded files
- Download uploaded files
- Metadata of uploaded files stored in SQLite-backed storage

  ![image](https://github.com/user-attachments/assets/bde5f550-f4a6-4a10-92c5-0752fafc685a)


- Toast-based error handling

<img width="1844" height="958" alt="image" src="https://github.com/user-attachments/assets/41bf955c-3069-4a18-a474-0d5f481fd40e" />



---


## API Routes (`src/app/api`)

- `delete/route.ts`: POST — deletes a file by `fileId` from disk and DB
- `files/route.ts`: GET — fetches folders/files (default: `root`)
- `folder/route.ts`: POST — creates a folder with `name` and `parentId`
- `path/route.ts`: GET — retrieves folder path for breadcrumbs
- `upload/route.ts`: POST — handles file uploads and text extraction using deepseek api and pdf-parse package(up to 10MB)
- ```'logs/route.ts'```: — for sending filelogs as json to be displayed in ledger

---

## UI Components (`src/components`)

- `Breadcrumb.tsx`: Shows navigable folder path via `/api/path`
- `FileUploader.tsx`: Upload interface with toast notifications
- `CreateFolderDialog.tsx`: Input dialog to add new folders
- `FileManager.tsx`: Main UI logic, state manager, and layout renderer contains clickable folder cards and files with metadata and actions (download, delete)
- ```'Ledger/page.tsx'```: Handles the tables and data to be displayed in the ledger
---

