# USB debugging — connect phone to CasaClick API

## Two ways (pick one in `src/app/api/config.ts`)

| Mode | `ANDROID_CONNECT_MODE` | API host | Backend bind | Phone setup |
|------|------------------------|----------|--------------|-------------|
| **USB + PC IP** (recommended) | `usb-lan` | Your PC IPv4 from `ipconfig` | `0.0.0.0:8000` | Phone can use USB tethering or same Wi‑Fi |
| USB + adb reverse | `usb-adb` | `127.0.0.1` | `127.0.0.1:8000` or `0.0.0.0` | Must run `npm run android:reverse` |

Default in this project: **`usb-lan`** with IP synced from `ipconfig`.

---

## 1. Phone setup

- Enable **Developer options** → **USB debugging**
- Plug in USB → allow **RSA debugging** prompt

```powershell
adb devices
```

Must show `device` (not `unauthorized`).

---

## 2. Fix your PC IP (ipconfig)

From project root:

```powershell
cd "C:\Users\Maligalig\APP DEV\BinRazali"
npm run sync:pc-ip
```

This updates `ANDROID_PC_LAN_HOST` in `src/app/api/config.ts` (e.g. `192.168.137.200`).

Manual check:

```powershell
ipconfig
```

Use the IPv4 on the adapter your phone uses:

- **USB tethering / Mobile hotspot:** often `192.168.137.x`
- **Home Wi‑Fi:** often `192.168.1.x` or `192.168.0.x`

Do **not** use VirtualBox/VMware IPs (`192.168.56.x`, `192.168.135.x`, `172.x.x.x`).

Confirm in `src/app/api/config.ts`:

```ts
export const ANDROID_CONNECT_MODE: AndroidConnectMode = 'usb-lan';
export const ANDROID_PC_LAN_HOST = 'YOUR_IP_HERE'; // from sync:pc-ip
```

---

## 3. Start backend (must listen on all interfaces)

```powershell
npm run casaclick:serve
```

Uses `php -S 0.0.0.0:8000` so the phone can reach `http://YOUR_PC_IP:8000`.

Test on PC browser:

`http://192.168.137.200:8000/api/mobile/home`  
(replace with your IP)

---

## 4. Metro + USB reverse (JS bundle only)

```powershell
npm start
```

In another terminal:

```powershell
npm run android:reverse
```

For **`usb-lan`**, reverse is only required for Metro (**8081**). API uses your PC IP directly.

Full USB install:

```powershell
npm run android:usb
```

(runs `sync:pc-ip` + reverse + build)

---

## 5. Windows Firewall

If the phone cannot connect, allow **PHP** or **port 8000** on Private networks:

- Windows Security → Firewall → Allow an app → PHP  
- Or inbound rule: TCP **8000** Private

---

## 6. Troubleshooting

| Problem | Fix |
|---------|-----|
| Cannot reach API | `npm run sync:pc-ip`, restart `casaclick:serve`, check firewall |
| Wrong IP after changing Wi‑Fi | Run `npm run sync:pc-ip` again, reload app |
| Metro red screen | `npm run android:reverse`, `npm start` |
| Works on PC, not phone | Backend must use `0.0.0.0:8000`, not only `127.0.0.1` |
| Still fails | Try `usb-adb` mode + `npm run android:reverse` |

---

## Quick checklist

1. `npm run sync:pc-ip`
2. `ANDROID_CONNECT_MODE = 'usb-lan'`
3. `npm run casaclick:serve`
4. Open `http://<YOUR_IP>:8000/api/mobile/home` in PC browser — must return JSON
5. `npm run android:reverse` + `npm run android`
6. Sign in: `tenant@example.com` / `tenant2222`
