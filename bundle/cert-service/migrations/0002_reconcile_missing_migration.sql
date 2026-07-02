-- Placeholder migration for older database instances that already applied the
-- historical migration version 2 before the migration file was added to source.
-- This keeps SQLx's migration history consistent without re-running schema changes.
SELECT 1;
