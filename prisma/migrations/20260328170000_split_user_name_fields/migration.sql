-- AlterTable
ALTER TABLE "User"
ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "firstName" TEXT,
ADD COLUMN "middleName" TEXT NOT NULL DEFAULT '';

WITH parts AS (
  SELECT
    "id",
    regexp_split_to_array(NULLIF(btrim("fullName"), ''), '\s+') AS name_parts
  FROM "User"
)
UPDATE "User" AS u
SET
  "lastName" = CASE
    WHEN COALESCE(array_length(parts.name_parts, 1), 0) >= 2 THEN parts.name_parts[1]
    ELSE ''
  END,
  "firstName" = CASE
    WHEN COALESCE(array_length(parts.name_parts, 1), 0) >= 2 THEN parts.name_parts[2]
    WHEN COALESCE(array_length(parts.name_parts, 1), 0) = 1 THEN parts.name_parts[1]
    ELSE 'Пользователь'
  END,
  "middleName" = CASE
    WHEN COALESCE(array_length(parts.name_parts, 1), 0) >= 3
      THEN array_to_string(parts.name_parts[3:array_length(parts.name_parts, 1)], ' ')
    ELSE ''
  END
FROM parts
WHERE u."id" = parts."id";

ALTER TABLE "User"
ALTER COLUMN "firstName" SET NOT NULL;

ALTER TABLE "User"
DROP COLUMN "fullName";
