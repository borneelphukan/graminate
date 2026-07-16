-- Set subscription_expires_at for non-FREE users where it is NULL
UPDATE "users"
SET "subscription_expires_at" = NOW() + INTERVAL '30 days'
WHERE "plan" IN ('BASIC', 'PRO') AND "subscription_expires_at" IS NULL;
