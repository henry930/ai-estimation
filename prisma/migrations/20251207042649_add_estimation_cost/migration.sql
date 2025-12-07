-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_estimations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "tasks" TEXT NOT NULL,
    "totalHours" INTEGER NOT NULL,
    "minHours" INTEGER,
    "maxHours" INTEGER,
    "cost" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "estimations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_estimations" ("createdAt", "id", "maxHours", "minHours", "projectId", "status", "tasks", "totalHours", "updatedAt") SELECT "createdAt", "id", "maxHours", "minHours", "projectId", "status", "tasks", "totalHours", "updatedAt" FROM "estimations";
DROP TABLE "estimations";
ALTER TABLE "new_estimations" RENAME TO "estimations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
