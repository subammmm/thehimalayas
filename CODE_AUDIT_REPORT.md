# 🔍 Code Audit Report - The Himalayas Platform
**Generated:** December 24, 2025  
**Status:** 🚨 Multiple issues found requiring attention

---

## 📊 Summary

This audit identified **18 distinct issues** across configuration, code quality, and best practices:

- 🔴 **Critical Issues:** 5
- 🟡 **Warnings:** 8  
- 🟢 **Improvements:** 5

---

## 🔴 Critical Issues

### 1. **Missing Supabase Dependency**
**Location:** `package.json`  
**Severity:** 🔴 Critical

The code imports `@supabase/supabase-js` but it's **not listed in package.json dependencies**.

```typescript
// src/lib/supabase.ts:1
import { createClient } from '@supabase/supabase-js';
```

**Fix Required:**
```bash
npm install @supabase/supabase-js
```

---

### 2. **React Hooks Called Conditionally**
**Location:** `src/pages/LocationDetailsPage.tsx:85-86`  
**Severity:** 🔴 Critical  
**Error:** `react-hooks/rules-of-hooks`

```typescript
// Lines 85-86 are AFTER conditional returns (lines 27-77)
const [showCitation, setShowCitation] = useState(false);
const [copied, setCopied] = useState(false);
```

**Issue:** Hooks are called after early returns, violating React's rules. Hooks must be at the top level.

**Fix Required:** Move all `useState` calls to the top of the component, before any conditional logic.

---

### 3. **Duplicate Loading Check**
**Location:** `src/pages/LocationDetailsPage.tsx:27-28`  
**Severity:** 🟡 Warning  
**Type:** Logic error

```typescript
if (loading && !location) {
    if (loading && !location) {  // ← Duplicate condition!
        return (...)
```

**Fix:** Remove the duplicate nested if statement.

---

### 4. **setState in useEffect (Multiple Locations)**
**Severity:** 🔴 Critical  
**Error:** `react-hooks/set-state-in-effect`

**Locations:**
- `src/components/map/MapLibreCanvas.tsx:94`
- `src/pages/HimalayanMapPage.tsx:35`

```typescript
// HimalayanMapPage.tsx:33-37
useEffect(() => {
    if (selectedFromSearch) {
        setSelectedLocation(selectedFromSearch); // ⚠️ Cascading render
    }
}, [selectedFromSearch]);
```

**Issue:** Synchronous setState in effects causes performance issues and cascading renders.

**Fix:** Use derived state or ref-based solutions instead.

---

### 5. **Components Created During Render**
**Location:** `src/pages/StatsDashboard.tsx:43, 153`  
**Severity:** 🔴 Critical  
**Error:** `react-hooks/static-components`

```typescript
const CustomTooltip = ({ active, payload, label }: any) => {
    // ⚠️ This component resets state on every render
};
```

**Fix:** Move `CustomTooltip` **outside** the component function or use `useMemo`.

---

## 🟡 Warnings & Code Quality Issues

### 6. **TypeScript `any` Usage**
**Location:** `src/pages/StatsDashboard.tsx:43`  
**Severity:** 🟡 Warning  
**Error:** `@typescript-eslint/no-explicit-any`

```typescript
const CustomTooltip = ({ active, payload, label }: any) => {
```

**Fix:** Define proper TypeScript interfaces.

---

### 7. **Unused Expressions in MapboxCanvas**
**Location:** `src/components/map/MapboxCanvas.tsx`  
**Severity:** 🟡 Warning  
**Errors at lines:** 50, 62, 143, 150, 155

```typescript
// Example pattern (line 50, 62, etc.):
selectedLocation?.id;  // ⚠️ Expression with no side effect
```

**Fix:** These are likely optional chaining checks that should be conditions or assignments.

---

### 8. **Missing Dependency in useEffect**
**Location:** `src/components/map/CesiumCanvas.tsx:289`  
**Severity:** 🟡 Warning

```typescript
// Missing: 'filteredLocations' and 'showConnections' in dependency array
```

**Fix:** Add missing dependencies or use ESLint disable comment if intentional.

---

### 9. **Hardcoded Supabase Credentials**
**Location:** `src/lib/supabase.ts:4-5`  
**Severity:** 🟡 Security Concern

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://frpjuymnrdrtmnwnnigx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGci...';
```

**Issue:** Fallback credentials are hardcoded (though anon keys are somewhat safe).

**Recommendation:** Remove fallbacks in production or at least add a console warning.

---

### 10. **Missing Meta Tags for SEO**
**Location:** `index.html`  
**Severity:** 🟢 Improvement

Current title: `the-himalayas` (lowercase, generic)

**Missing:**
- `<meta name="description" content="...">`
- `<meta property="og:title" content="...">`
- `<meta property="og:description" content="...">`
- `<meta property="og:image" content="...">`
- `<meta name="twitter:card" content="...">`

**Fix:** Add proper SEO meta tags.

---

## 🟢 Configuration & Best Practice Improvements

### 11. **Generic Favicon**
**Location:** `index.html:5`  
**Severity:** 🟢 Improvement

```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

**Recommendation:** Replace `/vite.svg` with a custom Himalayas-themed favicon.

---

### 12. **Vite Config - Unused Library in Chunks**
**Location:** `vite.config.ts:13`  
**Severity:** 🟢 Improvement

```typescript
manualChunks: {
    'leaflet': ['leaflet', 'react-leaflet']  // ⚠️ Leaflet still in build
}
```

**Issue:** You're using Cesium/Mapbox, but Leaflet is still bundled separately.

**Recommendation:** If you've removed Leaflet, remove this chunk config too.

---

### 13. **Build Chunk Size Warning Limit**
**Location:** `vite.config.ts:17`  
**Severity:** 🟢 Info

```typescript
chunkSizeWarningLimit: 2000  // 2MB
```

**Current:** Set to 2000 KB (quite large for web).  
**Recommendation:** Monitor actual bundle sizes and consider code-splitting or lazy loading.

---

### 14. **ESLint Config - Outdated Import**
**Location:** `eslint.config.js:6`  
**Severity:** 🟡 Warning

```javascript
import { defineConfig, globalIgnores } from 'eslint/config'
```

**Issue:** This import might fail in some ESLint versions. The standard is:
```javascript
import { defineConfig } from 'eslint/config'
```

---

### 15. **Missing .nvmrc or .node-version**
**Severity:** 🟢 Improvement

**Recommendation:** Add `.nvmrc` to lock Node version for consistency across team/deployments.

```
18.17.0
```

---

### 16. **No CI/CD Configuration**
**Severity:** 🟢 Improvement

**Missing:** GitHub Actions, CircleCI, or any automated testing/linting on push.

**Recommendation:** Add `.github/workflows/ci.yml` for automated checks.

---

### 17. **Missing Error Handling in Image Loading**
**Location:** Multiple components (LocationDetailsPage, Home, etc.)  
**Severity:** 🟡 Warning

```tsx
<img src={location.images[0]} alt={location.name} />
```

**Issue:** No fallback if image fails to load (404, CORS, etc.).

**Fix:** Add `onError` handler with placeholder image.

---

### 18. **Unused Import Warning**
**Location:** `src/pages/Home.tsx:4`  
**Severity:** 🟢 Minor

```typescript
import { Link } from 'react-router-dom'; // Keep Link if used, or remove both if unused
```

**Fix:** If `Link` is unused, remove it.

---

## 🛠️ Recommended Action Plan

### Phase 1: Critical Fixes (Do First)
1. ✅ Install missing `@supabase/supabase-js` dependency
2. ✅ Fix React Hooks rule violations in `LocationDetailsPage.tsx`
3. ✅ Remove duplicate loading check
4. ✅ Fix setState in useEffect issues
5. ✅ Move `CustomTooltip` outside render in `StatsDashboard.tsx`

### Phase 2: Code Quality (Next)
6. ✅ Fix unused expressions in `MapboxCanvas.tsx`
7. ✅ Add TypeScript types instead of `any`
8. ✅ Add useEffect dependency arrays
9. ✅ Add image error handling

### Phase 3: Enhancements (Optional)
10. ✅ Add SEO meta tags to `index.html`
11. ✅ Replace default Vite favicon
12. ✅ Clean up Vite config (remove Leaflet if unused)
13. ✅ Add CI/CD workflow

---

## 📈 Lint Results Summary

```
Total Errors: 11
Total Warnings: 2
Files with Issues: 6

Most Problematic Files:
1. LocationDetailsPage.tsx - 3 errors
2. StatsDashboard.tsx - 3 errors  
3. MapboxCanvas.tsx - 5 errors
4. HimalayanMapPage.tsx - 1 error
5. MapLibreCanvas.tsx - 1 error
6. CesiumCanvas.tsx - 1 warning
```

---

## 🎯 Next Steps

Would you like me to:
1. **Auto-fix** the critical issues automatically?
2. **Generate** a detailed fix guide for each issue?
3. **Prioritize** and tackle issues one-by-one with you?
4. **Set up** CI/CD and linting automation?

Let me know how you'd like to proceed! 🚀
