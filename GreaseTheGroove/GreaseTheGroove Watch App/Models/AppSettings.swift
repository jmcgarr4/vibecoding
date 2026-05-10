import Foundation

struct AppSettings: Codable {
    var morningAlarmHour: Int
    var morningAlarmMinute: Int
    var morningAlarmEnabled: Bool
    var lastTimerChoice: Int  // 2 or 3 hours; 0 means "done for today" was last picked

    static let `default` = AppSettings(
        morningAlarmHour: 7,
        morningAlarmMinute: 0,
        morningAlarmEnabled: true,
        lastTimerChoice: 2
    )
}
