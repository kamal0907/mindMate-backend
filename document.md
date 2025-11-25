POST /api/diary — create entry (authenticated). Payload: { content, emotions: {happy:3,...}, isPublic, tags, moodSummary }

GET /api/diary — list user’s entries (auth) with pagination: ?page=1&limit=20

GET /api/diary/public — list public entries for feed (pagination, sort by createdAt desc)

GET /api/diary/:id — get single entry (public or owned)

PUT /api/diary/:id — update (only owner)

DELETE /api/diary/:id — delete (only owner)

POST /api/gratitude — create entry (authenticated). Payload: { content }

GET /api/gratitude/:id — get single entry (public or owned)

<!-- PUT /api/gratitude/:id — update (only owner)

DELETE /api/gratitude/:id — delete (only owner) -->
