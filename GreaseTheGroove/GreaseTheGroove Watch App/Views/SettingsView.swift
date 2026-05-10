import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var store: Store
    @EnvironmentObject var notificationManager: NotificationManager

    // Local state mirrors store.settings so pickers can bind
    @State private var alarmHour: Int = 7
    @State private var alarmMinute: Int = 0
    @State private var alarmEnabled: Bool = true

    var body: some View {
        List {
            Section("Morning Alarm") {
                Toggle("Enabled", isOn: $alarmEnabled)
                    .onChange(of: alarmEnabled) { _, enabled in
                        store.settings.morningAlarmEnabled = enabled
                        store.saveSettings()
                        if enabled {
                            notificationManager.scheduleMorningAlarm(hour: alarmHour, minute: alarmMinute)
                        } else {
                            notificationManager.cancelMorningAlarm()
                        }
                    }

                if alarmEnabled {
                    hourPicker
                    minutePicker
                }
            }

            Section("Notifications") {
                HStack {
                    Text("Status")
                    Spacer()
                    permissionLabel
                }
                if notificationManager.authorizationStatus == .denied {
                    Text("Enable in Watch Settings → Notifications → GreaseTheGroove.")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .navigationTitle("Settings")
        .onAppear {
            alarmHour = store.settings.morningAlarmHour
            alarmMinute = store.settings.morningAlarmMinute
            alarmEnabled = store.settings.morningAlarmEnabled
            Task { await notificationManager.refreshStatus() }
        }
    }

    // MARK: - Pickers

    private var hourPicker: some View {
        Picker("Hour", selection: $alarmHour) {
            ForEach(0..<24, id: \.self) { h in
                Text(String(format: "%02d", h)).tag(h)
            }
        }
        .onChange(of: alarmHour) { _, h in
            store.settings.morningAlarmHour = h
            store.saveSettings()
            if alarmEnabled {
                notificationManager.scheduleMorningAlarm(hour: h, minute: alarmMinute)
            }
        }
    }

    private var minutePicker: some View {
        Picker("Minute", selection: $alarmMinute) {
            ForEach([0, 15, 30, 45], id: \.self) { m in
                Text(String(format: ":%02d", m)).tag(m)
            }
        }
        .onChange(of: alarmMinute) { _, m in
            store.settings.morningAlarmMinute = m
            store.saveSettings()
            if alarmEnabled {
                notificationManager.scheduleMorningAlarm(hour: alarmHour, minute: m)
            }
        }
    }

    // MARK: - Notification status label

    @ViewBuilder
    private var permissionLabel: some View {
        switch notificationManager.authorizationStatus {
        case .authorized:
            Label("Allowed", systemImage: "checkmark.circle.fill")
                .foregroundStyle(.green)
                .font(.caption)
        case .denied:
            Label("Denied", systemImage: "xmark.circle.fill")
                .foregroundStyle(.red)
                .font(.caption)
        default:
            Label("Not set", systemImage: "questionmark.circle")
                .foregroundStyle(.secondary)
                .font(.caption)
        }
    }
}
