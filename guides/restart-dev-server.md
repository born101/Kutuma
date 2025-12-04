# Restarting the Dev Server

Follow these steps whenever you need a clean restart so new code is picked up everywhere (Metro, Expo, and connected devices).

1. **Stop the current server**  
   Focus the terminal that is running Expo/Metro and press `Ctrl + C` (or `Cmd + C` on macOS). Wait for the shell prompt to reappear so you know the process fully terminated.

2. **(Optional) Clear caches**  
   When debugging stubborn issues, wipe caches before restarting:
   ```bash
   bunx expo start --clear
   ```
   Let this finish; it only prepares caches and will exit automatically when done.

3. **Start the server again**  
   Pick the mode that matches how you test:
   - Standard LAN (same Wi-Fi devices):
     ```bash
     bun run start
     ```
   - Tunnel (best for remote/guest networks or cellular devices):
     ```bash
     bun run start -- --tunnel
     ```
   - Web preview:
     ```bash
     bun run start-web
     ```

4. **Wait for Expo output**  
   The CLI will print a QR code plus URLs such as `exp://...`, `http://localhost:8081`, or `https://*.exp.direct`. These confirm Metro is ready.

5. **Reconnect your device**  
   - Expo Go / Rork mobile app: tap **Scan QR Code** (or enter the tunnel URL manually).
   - Web preview: open the printed `http://localhost:8081` (or tunnel) URL in your browser.

6. **Confirm reload**  
   Watch the terminal and device logs. You should see a fresh bundle build and your latest code running.

If something still feels stale, repeat the steps but also delete the `.expo` folder and rerun `bun install` to ensure dependencies are up to date before starting again.
