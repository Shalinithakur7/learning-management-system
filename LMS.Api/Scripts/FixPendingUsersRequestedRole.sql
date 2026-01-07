-- Fix existing PENDING users by setting their RequestedRole
-- This script sets RequestedRole = 'STUDENT' for all PENDING users who don't have it set

UPDATE AspNetUsers
SET RequestedRole = 'STUDENT'
WHERE Status = 0  -- 0 = Pending (enum value)
  AND (RequestedRole IS NULL OR RequestedRole = '');

-- Verify the update
SELECT 
    Id,
    FullName,
    Email,
    RequestedRole,
    Status
FROM AspNetUsers
WHERE Status = 0;  -- Show all PENDING users

-- Optional: If you want to set INSTRUCTOR for specific users, run this:
-- UPDATE AspNetUsers
-- SET RequestedRole = 'INSTRUCTOR'
-- WHERE Email IN ('instructor@gmail.com', 'instructor1@gmail.com', 'instructor2@gmail.com')
--   AND Status = 0;
