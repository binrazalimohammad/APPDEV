## Smoke test log

Run date: ________  
Device: ________ (model, Android version/API)  
Build: ________ (debug/release, git commit if applicable)  
API mode: ________ (`USE_PRODUCTION_API=true/false`)  

### Results

| Test | Steps | Expected | Actual | Pass/Fail |
|------|-------|----------|--------|----------|
| Install/launch | Install APK, open app | App opens | | |
| Login success | Login with tenant credentials | Dashboard loads | | |
| Login failure | Login with wrong password | Error shown | | |
| Listings | Open listings, open detail | Data loads | | |
| Apply | Apply to listing | Success + appears in applications | | |
| Profile update | Edit profile and save | Saved + persists after relaunch | | |
| Notifications | Open notifications, mark read | Updates counts | | |
| Realtime | Trigger backend notification | App receives update | | |
| Local notification | Background app, trigger backend notification | Android notification shown | | |

### Notes / bugs found

- 

