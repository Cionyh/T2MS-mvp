/*
  Warnings:

  - You are about to drop the column `bgColor` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `dismissAfter` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `font` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `textColor` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "bgColor",
DROP COLUMN "dismissAfter",
DROP COLUMN "font",
DROP COLUMN "textColor",
DROP COLUMN "type";
