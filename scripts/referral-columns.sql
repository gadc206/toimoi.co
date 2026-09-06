ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "resumeUrl" TEXT;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "referredById" TEXT;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "referralCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "listPriority" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "listBoostedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Person_referralCode_key" ON "Person"("referralCode");
CREATE INDEX IF NOT EXISTS "Person_referredById_idx" ON "Person"("referredById");
CREATE INDEX IF NOT EXISTS "Person_listPriority_idx" ON "Person"("listPriority");
