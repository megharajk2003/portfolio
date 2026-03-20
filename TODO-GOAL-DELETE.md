# Add Delete Goal Logic + Trash Button with Alert - COMPLETE ✅

**Status:** Already implemented in goal-start.tsx

## Implementation Details

```
✅ Backend: DELETE /api/goals/:id (cascade deletes categories/topics/subtopics)
✅ Frontend: goal-start.tsx
  - Trash2 icon (absolute top-right on each goal card)
  - useMutation with error handling + toast
  - AlertDialog confirmation ("This action cannot be undone...")
  - Stops propagation (no accidental navigation)
  - Refetches goals list on success
✅ Auth protected + ownership verification
✅ Cascade delete works (DB foreign keys)
```

**Test:** Navigate to /goal-start → Click trash icon → Confirm → Goal + all data deleted

**Files:**

- server/routes.ts (route + auth)
- server/storage.ts (deleteGoal impl)
- client/src/pages/goal-start.tsx (UI + mutation)

Feature ready-to-use! 🎯
