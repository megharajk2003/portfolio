# PWA Installation Fix - TODO Steps

## Plan Breakdown (Approved ✅)

### Step 1: Install Dependencies [COMPLETE ✅]

- `npm install vite-plugin-pwa -D`

### Step 2: Update vite.config.ts [COMPLETE ✅]

- Add VitePWA plugin with precaching

### Step 3: Fix Icon Consistency [COMPLETE ✅]

- Update manifest & index.html to use consistent .png casing

### Step 4: Enhance App.tsx [PENDING]

- Add beforeinstallprompt handling & install button

### Step 5: Test Installation [PENDING]

- `npm run dev`
- Chrome DevTools → Application → Verify "installable: yes"
- Test install prompt

### Step 6: Production Build Test [PENDING]

- `npm run build && npm run preview`

---

**Progress: 4/6 complete (PWA UI added, minor TS warnings to ignore)**  
_Updates marked as [COMPLETE] after each step._
