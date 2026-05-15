# SmartBilling v4.0 — PWA Edition 📲

## What's Inside

```
SmartBilling_PWA/
├── index.html        ← Your app (PWA-enabled)
├── manifest.json     ← App identity (name, icon, colors)
├── sw.js             ← Service Worker (offline + caching)
├── icons/            ← App icons (all sizes)
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
└── README.md         ← This file
```

## PWA Features Added

| Feature | Status |
|---|---|
| Install to Home Screen (Android/iOS/Desktop) | ✅ |
| Offline mode with friendly message | ✅ |
| App icon (all sizes) | ✅ |
| Fullscreen / standalone mode | ✅ |
| Splash screen | ✅ |
| iPhone notch / Dynamic Island safe areas | ✅ |
| Background sync notification | ✅ |
| Auto-update banner | ✅ |
| Service worker caching | ✅ |
| App shortcuts (New Invoice, Inventory) | ✅ |

---

## Step 1: Configure Firebase (same as before)

Open `index.html` in a text editor and fill in your Firebase config:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

---

## Step 2: Host the Files (PWA REQUIRES a web server)

> ⚠️ A PWA **cannot** run from a local file (`file://`). It must be served over HTTPS.

### Option A — Firebase Hosting (Recommended, Free)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting     # set public dir to this folder
firebase deploy
```

Your app will be live at `https://YOUR_PROJECT_ID.web.app` instantly.

### Option B — Netlify (Drag & Drop, Free)

1. Go to https://netlify.com
2. Drag the entire `SmartBilling_PWA/` folder onto the deploy area
3. Done — you get a free HTTPS URL in seconds

### Option C — GitHub Pages (Free)

1. Push this folder to a GitHub repo
2. Go to Settings → Pages → Deploy from main branch
3. Your app is live at `https://username.github.io/repo-name/`

### Option D — Any Web Host

Upload all files maintaining the folder structure. Must be served over HTTPS.

---

## Step 3: Install the App

Once hosted:

### On Android (Chrome)
- Open your URL in Chrome
- After 3 seconds, an **"Install SmartBilling"** banner appears at the bottom
- Tap **Install** → it's on your home screen instantly

### On iPhone (Safari)
- Open your URL in Safari
- Tap the **Share** button (square with arrow)
- Tap **"Add to Home Screen"**
- Tap **Add**

### On Desktop (Chrome / Edge)
- Open your URL
- Look for the **install icon** (⊕) in the address bar
- Click it → Install

---

## How Offline Mode Works

- First visit: the service worker caches the app shell
- Next visits: app loads instantly even offline
- Firebase data requires internet (Firestore has its own built-in offline cache enabled in your app)
- When you go offline, a yellow banner appears
- When you reconnect, Firebase auto-syncs and a toast confirms it

---

## Customizing Icons

The included icons are auto-generated with "SB" branding.  
To use your own logo:
1. Create a 512×512 PNG with transparent background
2. Replace all files in the `icons/` folder
3. Or use https://maskable.app/editor to create maskable icons

---

## Troubleshooting

**Install button doesn't appear?**  
→ Must be served over HTTPS (not localhost or file://)  
→ Must have a valid manifest.json and service worker  
→ Chrome requires the app to not already be installed

**Offline page shows instead of app?**  
→ Visit the app once while online to cache it, then try offline

**Icons not showing?**  
→ Verify the `icons/` folder is uploaded alongside `index.html`

---

*SmartBilling PWA Edition — Built with ❤️ | Works on every device, no app store needed*
