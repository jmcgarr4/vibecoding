import SwiftUI

struct TimerChoiceView: View {
    @EnvironmentObject var store: Store
    @EnvironmentObject var notificationManager: NotificationManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                Text("Next set in…")
                    .font(.headline)
                    .padding(.top, 8)

                timerButton(label: "2 hours", icon: "clock", hours: 2)
                timerButton(label: "3 hours", icon: "clock.badge.plus", hours: 3)

                Button {
                    notificationManager.cancelNextTimer()
                    store.settings.lastTimerChoice = 0
                    store.saveSettings()
                    dismiss()
                } label: {
                    Label("Done for today", systemImage: "moon.zzz.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(.secondary)
                .padding(.top, 4)
            }
            .padding(.horizontal, 4)
            .padding(.bottom, 8)
        }
    }

    private func timerButton(label: String, icon: String, hours: Int) -> some View {
        Button {
            notificationManager.scheduleNextTimer(hours: hours)
            store.settings.lastTimerChoice = hours
            store.saveSettings()
            dismiss()
        } label: {
            Label(label, systemImage: icon)
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(.borderedProminent)
        .tint(hours == 2 ? .blue : .indigo)
    }
}
