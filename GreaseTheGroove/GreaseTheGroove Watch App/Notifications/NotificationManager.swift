import Foundation
import UserNotifications

final class NotificationManager: NSObject, ObservableObject {
    @Published var authorizationStatus: UNAuthorizationStatus = .notDetermined

    private let morningAlarmId = "gtg.morning"
    private let nextTimerId = "gtg.nexttimer"

    override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
    }

    func requestAuthorization() async {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .sound])
            await MainActor.run { authorizationStatus = granted ? .authorized : .denied }
        } catch {}
        await refreshStatus()
    }

    func refreshStatus() async {
        let s = await UNUserNotificationCenter.current().notificationSettings()
        await MainActor.run { authorizationStatus = s.authorizationStatus }
    }

    // MARK: - Morning Alarm

    func scheduleMorningAlarm(hour: Int, minute: Int) {
        cancelMorningAlarm()
        var components = DateComponents()
        components.hour = hour
        components.minute = minute

        let content = UNMutableNotificationContent()
        content.title = "Grease the Groove"
        content.body = "Time for your first set today!"
        content.sound = .default
        content.interruptionLevel = .active

        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(identifier: morningAlarmId, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }

    func cancelMorningAlarm() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [morningAlarmId])
    }

    // MARK: - Next Set Timer

    func scheduleNextTimer(hours: Int) {
        cancelNextTimer()
        let content = UNMutableNotificationContent()
        content.title = "Grease the Groove"
        content.body = "Time for your next set!"
        content.sound = .default
        content.interruptionLevel = .active

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: TimeInterval(hours * 3600), repeats: false)
        let request = UNNotificationRequest(identifier: nextTimerId, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }

    func cancelNextTimer() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [nextTimerId])
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension NotificationManager: UNUserNotificationCenterDelegate {
    // Show alert even when app is foregrounded
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }
}
