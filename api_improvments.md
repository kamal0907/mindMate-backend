--------------------------GET api/diary

// routes/diary.route.js
import express from "express";
import Diary from "../models/DiaryEntry.js"; // or "../models/Diary.js" if your model is named Diary
import { authMiddleware, ensureAuthenticated } from "../middleware/auth.middleware.js"; // path: /mnt/data/auth.middleware.js

const router = express.Router();

/**
 * GET /api/diary
 * Query params:
 *   - page (default 1)
 *   - limit (default 20, max 100)
 *   - sort (optional, e.g. "newest" | "oldest")
 *
 * Returns paginated list of the current user's diary entries.
 */
router.get("/", authMiddleware, ensureAuthenticated, async (req, res) => {
  try {
    // parse query params with safe defaults
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 20;
    const sort = req.query.sort || "newest"; // "newest" or "oldest"

    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100; // hard cap

    const skip = (page - 1) * limit;

    // build query - only the current user's entries
    const query = { user: req.user.id };

    // sort order
    const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    // projection: choose fields to return; include content if you want full text
    // for list views you might prefer to exclude very large fields or return a preview
    const projection = {
      content: 1,
      emotions: 1,
      isPublic: 1,
      createdAt: 1,
      updatedAt: 1
    };

    // run count + find in parallel
    const [total, entries] = await Promise.all([
      Diary.countDocuments(query),
      Diary.find(query)
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .select(projection)
        .lean()
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.json({
      data: entries,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (err) {
    console.error("GET /api/diary error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

---------------------------------DELETE api/diary/:id

Soft reset : we maintain the deleted entry by adding the delete field in schema (deletedAt, deletedBy) 
