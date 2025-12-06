# ⚡ EXPO QR CODE QUICK START

**What You Need:** 2 phones + WiFi + 10 minutes  
**What You'll Get:** App running on real phones ✅  
**Then:** Test complete user flow  

---

## 🚀 5-Minute Setup

### Step 1: Install Expo Go (App Store / Google Play)
```
Search: "Expo Go"
Download: FREE
Time: 3 minutes
Do this on BOTH phones
```

### Step 2: Start Dev Server
```bash
cd "c:\Users\Bornwell\Desktop\bornwell stuff\New folder\Kutuma"
bun run start
```

**Wait for:**
```
Expo server is ready
```

### Step 3: Scan QR Code
**Terminal will show:**
```
Scan this QR code:
█████████████████████
█                   █
█  [QR CODE IMAGE]  █
█                   █
█████████████████████
```

**On Phone 1:**
1. Open Expo Go
2. Tap QR icon (bottom right)
3. Point at terminal QR code
4. ✅ App loads!

**On Phone 2:**
1. Open Expo Go
2. Tap QR icon (bottom right)
3. Scan same QR code
4. ✅ App loads on Phone 2 too!

---

## ✅ You're Done!

Both phones now have your app running live from your computer.

**Next:** Follow testing phases in `TESTING_GUIDE.md`

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| QR code too blurry | Increase terminal font (Ctrl+) |
| Can't scan | Make sure WiFi is same on phone & computer |
| App won't load | Check dev server is running (see "Expo server is ready") |
| Connection drops | Move phone closer or use tunnel: `bun run start --tunnel` |
| App crashes | Pull down in Expo Go and tap "Reload" |

---

## 📱 Ready?

1. Install Expo Go on both phones
2. Run `bun run start`
3. Scan QR code on both phones
4. Start testing! 🚀

---

**It's that simple!** Let's go! 💪
