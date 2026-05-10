# PRD: Grease the Groove — watchOS-Only App

## Overview

A self-contained Apple Watch app for the Grease the Groove training method. No iPhone companion app. All data, notifications, settings, and history live entirely on the Watch.

---

## Goals

- 100% Watch-self-contained: works without iPhone nearby or paired app running
- Log a set in < 5 taps
- Drive reminders via local notifications scheduled directly from the Watch

## Non-Goals (v1)

- iPhone companion app of any kind
- Watch complications
- Quiet hours / end-of-day cutoff
- Missed set tracking
- Per-exercise timers
- Rep targets or volume goals
- Any cloud sync or backup

---

## Core Concept

1. A morning alarm fires on the Watch.
2. You open the Watch app, pick an exercise, log reps.
3. After logging, choose **Soon (2h)** or **Later (3h)** for your next reminder — or **Done for today** to stop notifications.
4. Timer fires → notification on Watch → repeat.

The timer is shared across all exercises and resets from the moment *any* set is logged.

---

## Notification Design

| Event | Trigger | Delivery |
|---|---|---|
| Morning alarm | `UNCalendarNotificationTrigger` (daily, user-set time) | Watch local notification |
| Post-set timer | `UNTimeIntervalNotificationTrigger` (7200s or 10800s) | Watch local notification |

Both use **alert-style** interruption level (`UNNotificationInterruptionLevel.active`).

Fixed notification identifiers (`"gtg.morning"`, `"gtg.nexttimer"`) mean scheduling a new one automatically cancels the previous pending one.

---

## Data Model

```swift
struct Exercise: Identifiable, Codable {
    let id: UUID
    var name: String
    var lastRepCount: Int  // pre-fill default for stepper
}

struct SetEntry: Identifiable, Codable {
    let id: UUID
    let exerciseId: UUID
    let reps: Int
    let timestamp: Date
}

struct AppSettings: Codable {
    var morningAlarmHour: Int
    var morningAlarmMinute: Int
    var morningAlarmEnabled: Bool
    var lastTimerChoice: Int   // 2 or 3
}
```

`SetEntry` records older than **7 days** are pruned on each app launch.

---

## Screens (Watch only — 6 views)

### 1. Today List *(root screen)*
- List of exercises: name, sets today, total reps today
- Bottom section: navigation to Exercises, History, Settings
- Empty state guides user to add exercises

### 2. Log Set
- Exercise name as title
- Large rep count display, pre-filled with last rep count (default 1)
- +/− stepper
- "Done" button → Timer Choice sheet

### 3. Timer Choice Sheet *(presented after Done)*
- "Soon — 2 hours"
- "Later — 3 hours"
- "Done for today" → cancels timer, no more notifications today

### 4. Exercises
- List with swipe-to-delete
- Add Exercise → text input (dictation/scribble)

### 5. History
- Scrollable list of set entries from the last 7 days
- Format: exercise name, reps, time — grouped by day

### 6. Settings
- Morning alarm toggle + time picker
- Notification permission status

---

## Technical Architecture

### Target
| Target | Platform | Min OS |
|---|---|---|
| GreaseTheGroove | watchOS (standalone) | watchOS 10 |

Standalone Watch App — no iOS companion required.

### Data Storage
- `UserDefaults.standard` for all persistence (exercises, sets, settings)
- Single `Store` (`ObservableObject`) injected via `.environmentObject`

### Notifications
- `UNUserNotificationCenter.current()` — same API as iOS, fully supported on watchOS 10
- Request authorization on first launch
- Morning alarm: cancelled and rescheduled when user changes settings
- Post-set timer: cancelled and rescheduled after every confirmed set

### No WatchConnectivity, No App Group
Neither is needed without an iPhone companion app.

---

## Sideloading Setup (Free Apple ID)

1. Xcode → New Project → watchOS → **Watch App** (standalone)
2. Bundle ID: `com.YOURNAME.greasethegrove`
3. Team: personal Apple ID; Automatically manage signing
4. No entitlements needed (no App Group, no push certs)
5. Plug iPhone in via USB → select Watch as destination → ▶
6. Re-sign weekly: plug in iPhone, hit ▶

---

## Backlog (Future)

- Watch face complications
- iPhone companion app
- Configurable quiet hours
- iCloud backup
- Per-exercise timer intervals
