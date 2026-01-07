-- Delete users who were "Rejected" (marked as Pending with a rejection reason)
-- This cleans up users who were rejected before the backend code was updated to delete them

DELETE FROM AspNetUsers
WHERE Status = 0 -- Pending
AND RejectionReason IS NOT NULL;

-- Verify they are gone
SELECT * FROM AspNetUsers WHERE RejectionReason IS NOT NULL;
