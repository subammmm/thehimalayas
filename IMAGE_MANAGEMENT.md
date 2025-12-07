# 📸 Image Management for Research Database

## Current Problem
Mock data uses **random Unsplash images** - NOT actual location photos.

## Solutions for Real Images

### Option 1: Wikimedia Commons (Best for Research)
**Pros:**
- Free, properly licensed images
- Many Himalayan peaks/locations
- Verifiable sources
- Can be cited

**How to use:**
1. Search: https://commons.wikimedia.org/
2. Find image (e.g., "Mount Everest")  
3. Copy image URL
4. Update `mockData.ts`

**Example:**
```typescript
images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg/1280px-Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg'
]
```

---

### Option 2: Researcher Photos
If Sushan and the French researchers have photos:
1. Create `/public/images/locations/` folder
2. Add photos there
3. Reference in data:
```typescript
images: ['/images/locations/everest-001.jpg']
```

---

### Option 3: No Images (Temporary)
Better to show NO image than wrong image:

```typescript
// In mockData.ts, set:
images: []  // Empty until real photos available
```

---

## Quick Fix NOW

I can update all 56 locations to:
1. **Remove fake images** (set to empty array)
2. **Add source attribution field** to track where real images should come from
3. **Create upload system** (researchers can add images later)

**Want me to do this?**

---

## Long-term Solution

Build image upload feature where:
- Researchers log in
- Upload photos for locations
- Add proper attribution/date/photographer
- Auto-resize for web

This ensures **data integrity** for the research database.

---

**Which approach?**
A. Remove all fake images now (clean slate)
B. I'll find real Wikimedia images for top 10 peaks
C. Keep as-is for demo, fix later
