-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_file_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "file_logs_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_file_logs" ("action", "createdAt", "deletedAt", "fileId", "fileName", "fileSize", "id", "mimeType") SELECT "action", "createdAt", "deletedAt", "fileId", "fileName", "fileSize", "id", "mimeType" FROM "file_logs";
DROP TABLE "file_logs";
ALTER TABLE "new_file_logs" RENAME TO "file_logs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
