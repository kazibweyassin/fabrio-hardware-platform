-- Align account table with Better Auth schema
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_provider_providerAccount_key";

ALTER TABLE "account" RENAME COLUMN "provider" TO "providerId";
ALTER TABLE "account" RENAME COLUMN "providerAccount" TO "accountId";

ALTER TABLE "account" DROP COLUMN IF EXISTS "type";
ALTER TABLE "account" DROP COLUMN IF EXISTS "expiresAt";
ALTER TABLE "account" DROP COLUMN IF EXISTS "tokenType";
ALTER TABLE "account" DROP COLUMN IF EXISTS "sessionState";

ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "account_providerId_accountId_key" ON "account"("providerId", "accountId");