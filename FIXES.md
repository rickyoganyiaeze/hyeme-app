# HyeMe Bug Fixes

## 1. `backend/middleware/auth.middleware.js` — Double Response Crash
**Problem:** Missing `return` statements before `res.json()` and `next()` calls. Could cause "Cannot set headers after they are sent" error.
**Fix:** Added `return` before every `res.status()` and `next()` call. Also added a check for `!req.user` after DB lookup.

## 2. `backend/controllers/chat.controller.js` — `message.remove()` Crash
**Problem:** `document.remove()` was removed in Mongoose 7+. The `deleteMessage` function crashes.
**Fix:** Replaced `await message.remove()` with `await Message.findByIdAndDelete(req.params.messageId)`.

## 3. `backend/controllers/explore.controller.js` — Anonymous Status Validation Error
**Problem:** `createStatus` set `user: null` when `isAnonymous` is true, but the Status schema has `user` as `required: true`. This causes a Mongoose validation error.
**Fix:** Always set `user: req.user._id`. The `isAnonymous` flag is used client-side to hide the user's identity.

## 4. `backend/config/socket.js` — Inconsistent userId Types
**Problem:** Socket events emitted userId without `.toString()`, causing room mismatches.
**Fix:** Added `.toString()` to all userId references in emit calls for consistency.
