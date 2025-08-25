/*
  Warnings:

  - Added the required column `service` to the `ServiceEntry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServiceEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "service" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "method" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shiftId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    CONSTRAINT "ServiceEntry_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceEntry_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ServiceEntry" ("amount", "createdAt", "id", "method", "shiftId", "workerId", "service") SELECT "amount", "createdAt", "id", "method", "shiftId", "workerId", 'Услуга' FROM "ServiceEntry";
DROP TABLE "ServiceEntry";
ALTER TABLE "new_ServiceEntry" RENAME TO "ServiceEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
