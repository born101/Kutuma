# 📱 Expo Mobile Testing Guide - QR Code Method

**Purpose:** Test your Kutuma app on real mobile phones using Expo Go  
**Time Required:** 10-15 minutes setup + 1-2 hours testing  
**Difficulty:** Very Easy (just scan QR code!)  
**Result:** Real device testing before launch  

---

## 🎯 What is Expo Go?

**Expo Go** is a free app that lets you:
- ✅ Scan a QR code from your development server
- ✅ Run your app on your phone instantly
- ✅ No installation needed
- ✅ Hot reload (changes update automatically)
- ✅ Perfect for testing before launch

---

## 📋 Pre-Setup Checklist

Before you start, make sure you have:

- [ ] Two smartphones or tablets (iOS or Android)
- [ ] WiFi connection (dev server and phones on same WiFi)
- [ ] App Store (iOS) or Google Play (Android) access
- [ ] Dev server ready to start (`bun run start`)

---

## ⚡ Step-by-Step Setup (10 minutes)

### Step 1: Install Expo Go (5 minutes)

**On Phone 1 (For Requester Account):**
1. Open App Store (iOS) or Google Play (Android)
2. Search: "Expo Go"
3. Download and install (free)
4. Open the app
5. ✅ Done

**On Phone 2 (For Runner Account):**
1. Repeat steps 1-5 above
2. ✅ Done

### Step 2: Start Dev Server (3 minutes)

**On Your Computer:**

```bash
cd "c:\Users\Bornwell\Desktop\bornwell stuff\New folder\Kutuma"
bun run start
```

**Wait for this message:**
```
Expo server is ready
Press: i (iOS) | a (Android) | w (web) | r (reload) | q (quit)
```

### Step 3: Get QR Code (2 minutes)

**In Terminal Output, Look For:**
```
Scan this QR code:
█████████████████████
█                   █
█  [QR CODE IMAGE]  █
█                   █
█████████████████████

Or use link: exp://192.168.x.x:8081
```

**Copy this information:**
- 📱 QR code (visible in terminal)
- 🔗 Link: `exp://192.168.x.x:8081`

---

## 📱 Scanning QR Code (Very Easy!)

### On Phone 1 (Requester):

1. Open **Expo Go** app
2. Tap the **QR code icon** (usually bottom right)
3. Point phone camera at **terminal QR code**
4. ✅ App loads automatically!
5. Wait for: "Expo server is ready"

### On Phone 2 (Runner):

1. Open **Expo Go** app
2. Tap the **QR code icon**
3. Use same QR code from terminal
4. ✅ App loads on second phone!
5. Both phones now running your app!

---

## 🎨 Troubleshooting QR Code Scan

### "Can't scan QR code"
✅ **Solution:**
1. Make sure terminal is clearly visible
2. Increase terminal font size (Ctrl+)
3. Point phone camera at code
4. Move phone closer/farther
5. Try again

### "App won't load after scan"
✅ **Solution:**
1. Check WiFi: Both phones and computer on same network
2. Try again
3. Reload in Expo Go: Pull down and tap "Reload"
4. Restart Expo Go app

### "Connection refused error"
✅ **Solution:**
1. Check terminal shows "Expo server is ready"
2. Make sure dev server is still running
3. Make sure phones are on same WiFi as computer
4. Try restarting dev server

---

## 🔗 Alternative: Using Link Instead of QR Code

If QR code isn't working, use the link:

### On Phone 1:
1. Open Expo Go
2. Tap search icon (magnifying glass)
3. Paste: `exp://192.168.x.x:8081` (from terminal)
4. Tap Go
5. ✅ App loads

Replace `192.168.x.x` with the IP address from your terminal output.

---

## 🚀 Now You're Ready to Test!

Once both phones have the app loaded:

### Phone 1 Setup (Requester):
1. ✅ App is running
2. Tap **Sign Up**
3. Follow signup process
4. Choose mode: **"Looking for Help"**
5. Complete profile
6. ✅ You're Requester

### Phone 2 Setup (Runner):
1. ✅ App is running
2. Tap **Sign Up**
3. Follow signup process
4. Choose mode: **"I'm a Runner"**
5. Complete profile
6. ✅ You're Runner

### Then Follow Testing Guide:
See `TESTING_GUIDE.md` for complete flow:
- Phase 2: Post task (on Phone 1)
- Phase 3: Place bid (on Phone 2)
- Phase 4: Accept bid (on Phone 1)
- Phase 5: Complete task (on Phone 2)
- Phase 6: Rating (both phones)
- Phase 7: Payment (Phone 1)

---

## 💡 Pro Tips for Mobile Testing

### Switching Between Phones
1. Post task on Phone 1
2. Hand Phone 1 to person with Phone 2 (or use both yourself)
3. Check home feed on Phone 2
4. Place bid on Phone 2
5. Hand back to Phone 1
6. Accept on Phone 1
7. Continue flow

### Keeping Apps in Sync
- Both apps reload automatically when you save code
- If one phone gets out of sync: Pull down → "Reload"
- Refresh usually fixes any display issues

### Hot Reload
- When you make code changes, the app updates automatically on both phones
- Very useful for testing UI changes
- No need to restart anything!

### Viewing Console Errors
1. In Expo Go, tap "i" in menu
2. Shows error messages if app crashes
3. View full logs in terminal on computer

---

## 📊 Mobile vs Web Testing

| Aspect | Mobile (Expo Go) | Web Browser |
|--------|------------------|-------------|
| **Realism** | Most realistic | Less realistic |
| **Touch** | Real touch gestures | Mouse click |
| **Network** | Mobile WiFi/data | Computer WiFi |
| **Performance** | Real device perf | Browser perf |
| **Debugging** | Terminal logs | Browser console |
| **Setup** | 10 minutes | 2 minutes |
| **Best for** | Final testing | Quick testing |

**Recommendation:** Use mobile for final verification, web for quick iteration.

---

## ✅ Testing Checklist for Mobile

During testing on mobile phones, verify:

- [ ] App loads after scanning QR code
- [ ] No error messages on startup
- [ ] Sign up works on both phones
- [ ] Can post task (Phone 1)
- [ ] Task appears on Phone 2 feed
- [ ] Can place bid (Phone 2)
- [ ] Bid appears on Phone 1
- [ ] Can accept bid (Phone 1)
- [ ] Can complete task (Phone 2)
- [ ] Rating modal appears
- [ ] Can rate with stars
- [ ] Can submit rating
- [ ] Rating appears on profile
- [ ] Payment button appears
- [ ] Can submit payment
- [ ] No crashes during entire flow
- [ ] UI responsive on phone screen
- [ ] Text is readable
- [ ] Buttons are tap-able (not too small)
- [ ] Modals work smoothly
- [ ] Dark theme looks good on phone

---

## 🔄 Development Server Commands

While testing, you can control dev server with keyboard shortcuts:

```
Press in Terminal:
i  → Open iOS simulator
a  → Open Android emulator
w  → Open web browser
r  → Reload app on all devices
q  → Quit dev server
```

### Reload App on Phones
If you make changes to code:
1. Save file in VS Code
2. Press `r` in terminal
3. Both phones reload automatically ✅

---

## 📱 Expo Go Tips & Tricks

### View Recent Connections
1. Open Expo Go
2. Look for "Recently Opened" section
3. If you disconnect, can quickly reconnect here

### Device Logs
1. In Expo Go, tap bottom menu (⚙️)
2. View "Device Logs"
3. See what's happening on device
4. Useful for debugging

### Settings
1. Tap menu icon
2. Connection: Shows your connection status
3. Fast Refresh: Can toggle on/off
4. Development mode: Can toggle on/off

---

## 🆘 Common Issues & Solutions

### Issue: "Unable to connect"
**Solution:**
1. Both devices on same WiFi? ✅
2. Firewall blocking? Disable if possible
3. Dev server running? Check terminal
4. Try: `bun run start --tunnel` (uses tunnel instead of local IP)

### Issue: "App crashes on startup"
**Solution:**
1. Check terminal for error messages
2. View device logs in Expo Go
3. Check `app/_layout.tsx` for syntax errors
4. Save file again (trigger reload)

### Issue: "Code changes not appearing"
**Solution:**
1. Save file in VS Code (Ctrl+S)
2. Wait 2-3 seconds
3. Press `r` in terminal
4. App reloads on phones
5. Changes should appear

### Issue: "Connection drops"
**Solution:**
1. Move phone/computer closer
2. Check WiFi signal
3. Restart Expo Go app
4. Scan QR code again
5. `bun run start --tunnel` (more reliable)

---

## 🎯 Testing Flow on Mobile

```
15 minutes: Setup
├─ Install Expo Go (5 min)
├─ Start dev server (3 min)
├─ Scan QR code on both phones (5 min)
└─ Both apps ready

2 hours: Testing
├─ Create 2 accounts (10 min)
├─ Phase 1: Accounts
├─ Phase 2: Post task
├─ Phase 3: Place bid
├─ Phase 4: Accept bid
├─ Phase 5: Complete task
├─ Phase 6: Rating
├─ Phase 7: Payment
└─ Verify everything

Result: 
└─ App works on real devices! ✅
```

---

## 📊 Screen Size Considerations

### Testing Different Screen Sizes
- **Small phones** (5-6"): iPhone SE, Android compact
- **Regular phones** (6-6.5"): iPhone 13/14, Android standard
- **Large phones** (6.5"+): iPhone 14 Pro Max, Galaxy S23+

**UI should work on all sizes.** Your app is responsive!

---

## ✨ What to Look For During Mobile Testing

### Performance
- ✅ App loads quickly
- ✅ Buttons respond immediately
- ✅ Scrolling is smooth
- ✅ No lag when typing

### UI/UX
- ✅ Text is readable (not too small)
- ✅ Buttons are tap-able (good size)
- ✅ Spacing looks right
- ✅ Colors look good
- ✅ Dark theme is easy on eyes

### Functionality
- ✅ All features work
- ✅ Forms accept input
- ✅ Modals appear/close correctly
- ✅ Navigation works smoothly
- ✅ Data saves correctly

### Error Handling
- ✅ No crashes
- ✅ Error messages are clear
- ✅ App recovers from errors
- ✅ Console shows no critical errors

---

## 🎓 When to Use Each Testing Method

### Use Web Browser When:
- Making quick UI changes
- Testing layout
- Don't need real device feel
- Want fastest iteration

### Use Mobile (Expo Go) When:
- Final testing before launch
- Checking touch responsiveness
- Verifying on real screen size
- Want realistic user experience
- Ready to beta test

**Recommendation for Today:**
1. Quick web test first (verification)
2. Then mobile test (final check)
3. Then launch! 🚀

---

## 📱 Testing Both Phones Simultaneously

### Setup (Easiest Method)
```
Phone 1: Requester (in your left hand)
Phone 2: Runner (in your right hand)

Or have someone help:
You: Control Phone 1 (Requester)
Friend: Control Phone 2 (Runner)
```

### Testing Flow
1. You post task on Phone 1
2. Friend sees it on Phone 2
3. Friend places bid
4. You see it on Phone 1
5. Continue flow
6. Both phones connected same time
7. Real experience!

---

## ✅ Final Pre-Launch Checklist

Before launching to actual beta testers:

- [ ] App loads from QR code ✅
- [ ] No crashes on startup ✅
- [ ] Can create accounts ✅
- [ ] Can post tasks ✅
- [ ] Can place bids ✅
- [ ] Can complete tasks ✅
- [ ] Rating system works ✅
- [ ] Payment system works ✅
- [ ] Data saves to database ✅
- [ ] UI looks good on phone ✅
- [ ] Text is readable ✅
- [ ] Buttons work smoothly ✅
- [ ] No console errors ✅

All checked? **Ready to launch!** 🚀

---

## 🚀 After Mobile Testing

### If All Tests Pass ✅
1. You're ready for beta testing
2. Create accounts for beta testers
3. Share Expo Go link with them
4. Collect feedback
5. Launch publicly!

### If Issues Found ❌
1. Note the specific issue
2. Check if it's code or design
3. Fix if quick (< 5 min)
4. Re-test on mobile
5. Then launch

---

## 📞 Quick Reference

### Terminal Commands
```bash
# Start dev server
bun run start

# With tunnel (if WiFi issues)
bun run start --tunnel

# Reload app
Press 'r' in terminal
```

### Expo Go Actions
```
Scan QR code: QR icon (bottom right)
Enter link: Search icon (bottom left)
Reload app: Pull down → Reload
View logs: Menu → Device Logs
Settings: Menu → Settings
```

### Testing Accounts
```
Requester: requester@test.com
Runner: runner@test.com
```

---

**Status:** Ready for Mobile Testing  
**Time to Setup:** 10-15 minutes  
**Time to Test:** 1-2 hours  
**Expected Result:** App works on real phones ✅  

---

## 🎯 Your Immediate Next Steps

1. **Install Expo Go** on both phones (App Store/Google Play)
2. **Run dev server:** `bun run start`
3. **Wait for QR code** in terminal
4. **Scan with Phone 1** - Requester
5. **Scan with Phone 2** - Runner
6. **Follow TESTING_GUIDE.md** phases
7. **Verify everything works**
8. **LAUNCH!** 🎉

---

**Ready?** Install Expo Go and let's test on real devices! 📱✅
