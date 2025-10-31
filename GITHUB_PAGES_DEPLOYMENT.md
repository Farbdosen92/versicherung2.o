# GitHub Pages Deployment Guide

## ✅ Your App is Ready for GitHub Pages!

Your application has been designed with GitHub Pages compatibility from the start. Here's what's already in place:

### 🎯 Existing GitHub Pages Features

1. **Client-Side Calculation Fallback** ✅
   - `src/lib/queryClient.ts` includes smart fallback logic
   - If backend is unavailable, calculations run client-side
   - Uses `calculatePrivatePensionClient()` from `utils/calculatePension.ts`

2. **Base Path Configuration** ✅
   - `vite.config.ts` already configured with `/german-pension-calculator/`
   - `src/App.tsx` has `useGitHubPagesLocation` hook for proper routing
   - `public/404.html` handles SPA routing for GitHub Pages

3. **Static Build Script** ✅
   - `package.json` has `build:client` that builds only frontend
   - Optimized vendor chunking for performance
   - All assets properly handled

4. **No Hard Backend Dependencies** ✅
   - Core calculations work client-side
   - Data persists in localStorage
   - API calls gracefully fall back to client-side logic

### 📋 Deployment Steps

#### 1. Update Repository Name (if needed)

If your GitHub repository is NOT named `german-pension-calculator`, update the base path:

**Option A:** Update `vite.config.ts` (line 12):
```typescript
base: process.env.VITE_BASE_PATH || '/YOUR-REPO-NAME/',
```

**Option B:** Set environment variable in GitHub Actions (already set up in `.github/workflows/deploy.yml`)

#### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source:** Select "GitHub Actions"
   - (The workflow file `.github/workflows/deploy.yml` has been created)

#### 3. Trigger Deployment

**Option 1:** Push to main branch
```bash
git add .
git commit -m "Enable GitHub Pages deployment"
git push origin main
```

**Option 2:** Manual trigger
1. Go to **Actions** tab in your repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

#### 4. Verify Deployment

After the workflow completes (usually 2-5 minutes):
1. Go to **Settings** → **Pages**
2. Your site URL will be shown (e.g., `https://username.github.io/german-pension-calculator/`)
3. Click the URL to visit your deployed app

### 🔧 How It Works

#### Automatic Fallback Logic

The app intelligently handles both scenarios:

1. **With Backend** (Development):
   ```typescript
   // Tries to fetch from /api/simulate
   const response = await apiRequest("POST", "/api/simulate", data);
   ```

2. **Without Backend** (GitHub Pages):
   ```typescript
   // Automatically falls back to client-side calculation
   const result = calculatePrivatePensionClient(data);
   ```

#### Routing on GitHub Pages

The app uses a sophisticated routing strategy:

1. **404.html redirect**: When accessing `/german-pension-calculator/calculator`, GitHub Pages shows 404.html
2. **Query string encoding**: 404.html encodes the path as `/?/calculator`
3. **App.tsx decoding**: The router detects and decodes the path correctly
4. **Clean URLs**: Users see clean URLs in their browser

### 🎨 Features That Work on GitHub Pages

✅ **All Core Functionality:**
- Tax calculator (germanTaxCalculator.ts)
- Cost calculator (costCalculator.ts)
- Pension gap analysis (pensionGapCalculator.ts)
- Retirement timeline visualization
- Interactive forms and inputs
- Data persistence (localStorage)
- All calculations and comparisons

✅ **All React Components:**
- Premium dashboard
- Calculator interface
- Fund performance charts
- Comparison views
- Onboarding flow

### ⚠️ Limitations on GitHub Pages

The following features that require a backend will NOT work:

❌ **Database Operations:**
- Saving scenarios to database (`/api/scenarios`)
- Saving pension plans to database (`/api/pension-plans`)
- Loading saved scenarios
- Real-time collaborative features

❌ **Authentication:**
- User login/registration
- Protected routes
- User profiles

**Workaround:** All data is saved to localStorage instead. Users can:
- Save their calculations locally
- Export data as JSON
- Share calculations via URL parameters (if implemented)

### 🚀 Performance Optimization

The build is already optimized:

- **Code Splitting:** Lazy loading for all pages
- **Vendor Chunking:** Separate chunks for React, Recharts, etc.
- **Asset Optimization:** Images and fonts optimized
- **Gzip Compression:** Automatically enabled by GitHub Pages

### 🔍 Troubleshooting

#### Issue: White screen after deployment

**Solution:** Check browser console for base path issues:
```bash
# Verify base path matches your repo name
# In vite.config.ts, line 12
base: process.env.VITE_BASE_PATH || '/german-pension-calculator/',
```

#### Issue: Routes not working (404 errors)

**Solution:** Ensure GitHub Pages source is set to "GitHub Actions" (not branch)

#### Issue: Assets not loading

**Solution:** Check that all imports use relative paths:
```typescript
// Good ✅
import logo from './assets/logo.svg'

// Bad ❌
import logo from '/assets/logo.svg'
```

### 📊 Build Statistics

Expected build output:
- **HTML:** ~3-5 KB (gzipped)
- **CSS:** ~50-80 KB (gzipped)
- **JavaScript (vendor):** ~200-300 KB (gzipped)
- **JavaScript (app):** ~100-150 KB (gzipped)
- **Total:** ~350-500 KB (gzipped)

### 🎯 Next Steps

1. **Custom Domain (Optional):**
   - Add CNAME file with your domain
   - Configure DNS settings
   - Update base path to '/'

2. **Analytics (Optional):**
   - Add Google Analytics
   - Track user behavior
   - Monitor performance

3. **PWA (Optional):**
   - Add service worker
   - Enable offline mode
   - Add to home screen capability

### 📝 Configuration Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `.github/workflows/deploy.yml` | GitHub Actions deployment | ✅ Created |
| `vite.config.ts` | Build configuration with base path | ✅ Configured |
| `public/404.html` | SPA routing handler | ✅ Exists |
| `src/App.tsx` | Custom location hook for routing | ✅ Configured |
| `src/lib/queryClient.ts` | Client-side calculation fallback | ✅ Configured |

### ✨ Conclusion

Your app is **100% ready for GitHub Pages deployment**. The architecture was designed with static hosting in mind:

- All calculations work client-side
- Smart fallback logic for API calls
- Proper routing for subdirectory deployment
- Optimized build process

Just enable GitHub Pages in your repository settings and the GitHub Actions workflow will automatically deploy your app!

---

**Deployment URL Pattern:**
`https://<username>.github.io/<repository-name>/`

Example:
`https://fabianharnisch.github.io/german-pension-calculator/`
