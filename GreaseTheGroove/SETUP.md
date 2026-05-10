# Grease the Groove — Xcode Setup Guide

Sideload-only. Free Apple ID. No App Store, no TestFlight.

---

## One-time setup

### 1. Create the Xcode project

1. Open Xcode → **File → New → Project**
2. Choose **watchOS** tab → **Watch App** (standalone — NOT "Watch App for iOS App")
3. Fill in:
   - **Product Name:** `GreaseTheGroove`
   - **Bundle Identifier:** `com.YOURNAME.greasethegrove` (replace YOURNAME; must be unique)
   - **Team:** *(leave blank for now)*
   - **Language:** Swift
   - **Interface:** SwiftUI
   - Uncheck "Include Notification Scene" if offered — we add our own
4. Save the project somewhere convenient (e.g. `~/Developer/GreaseTheGroove`)

### 2. Add the source files

Copy the entire contents of `GreaseTheGroove Watch App/` from this repo into the
`GreaseTheGroove Watch App/` group that Xcode created.

In Xcode's Project Navigator, right-click the `GreaseTheGroove Watch App` group →
**Add Files to "GreaseTheGroove"** → select all the Swift files, making sure
**"Add to target: GreaseTheGroove Watch App"** is checked.

Delete the placeholder `ContentView.swift` that Xcode generated (it's replaced by
the files you just added).

### 3. Set your Team

1. Click the top-level **GreaseTheGroove** project in the navigator
2. Select the **GreaseTheGroove Watch App** target → **Signing & Capabilities**
3. **Team:** select your personal Apple ID (sign in via Xcode → Settings → Accounts if needed)
4. Xcode will auto-generate a provisioning profile. If it complains about the bundle ID
   already existing, add a suffix: `com.YOURNAME.greasethegrove2`

### 4. Capabilities to verify

No extra entitlements are required. Confirm that Signing & Capabilities shows:

- ✅ No App Group (not needed — single target, no companion app)
- ✅ No Push Notifications entitlement (local notifications don't need it on watchOS)

If Xcode added an "App Sandbox" capability automatically, that's fine — leave it.

### 5. Deploy to Watch

1. Plug your **iPhone** into your Mac via USB (required — Watch apps deploy wirelessly
   through the paired iPhone even though there's no iOS companion app)
2. In Xcode's toolbar, select your **Apple Watch** as the run destination
3. Hit **▶ (Run)**
4. The app installs on the Watch wirelessly. First run may take 1–2 minutes.

---

## Weekly re-signing (free Apple ID)

Free provisioning profiles expire after **7 days**.

To re-sign:
1. Plug iPhone into Mac
2. Open the project in Xcode
3. Hit **▶**

That's it. Xcode renews the certificate automatically. You don't need to delete the
app from the Watch first — it updates in place and preserves all data.

---

## First launch on the Watch

1. Open the **GreaseTheGroove** app on your Watch
2. You'll be prompted to **Allow Notifications** — tap Allow
3. Scroll to **Exercises** → add your first exercise (use dictation or the keyboard)
4. Scroll to **Settings** → enable the morning alarm and set your preferred time
5. Tap your exercise → log reps → choose when you want your next reminder

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Watch app not appearing as a destination | Make sure Watch is paired and iPhone is plugged in via USB |
| "Couldn't install" error | Try Product → Clean Build Folder (⇧⌘K) then run again |
| Notifications not arriving | Watch Settings → Notifications → GreaseTheGroove → Allow |
| "No account for team" error | Xcode → Settings → Accounts → add your Apple ID |
| Bundle ID conflict | Change the suffix in Bundle Identifier field |
