-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "defaultBgColor" TEXT DEFAULT '#222',
ADD COLUMN     "defaultDismissAfter" INTEGER DEFAULT 5000,
ADD COLUMN     "defaultFont" TEXT DEFAULT 'sans-serif',
ADD COLUMN     "defaultTextColor" TEXT DEFAULT '#fff',
ADD COLUMN     "defaultType" TEXT DEFAULT 'banner';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "bgColor" TEXT,
ADD COLUMN     "dismissAfter" INTEGER,
ADD COLUMN     "font" TEXT,
ADD COLUMN     "textColor" TEXT,
ALTER COLUMN "type" DROP NOT NULL;
