import SwiftUI

@main
struct GreaseTheGrooveApp: App {
    @StateObject private var store = Store()
    @StateObject private var notificationManager = NotificationManager()

    var body: some Scene {
        WindowGroup {
            TodayListView()
                .environmentObject(store)
                .environmentObject(notificationManager)
                .task {
                    await notificationManager.requestAuthorization()
                    // Re-arm morning alarm on every launch so it survives app reinstalls
                    if store.settings.morningAlarmEnabled {
                        notificationManager.scheduleMorningAlarm(
                            hour: store.settings.morningAlarmHour,
                            minute: store.settings.morningAlarmMinute
                        )
                    }
                }
        }
    }
}
