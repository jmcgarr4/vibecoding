import SwiftUI

struct TodayListView: View {
    @EnvironmentObject var store: Store
    @EnvironmentObject var notificationManager: NotificationManager

    var body: some View {
        NavigationStack {
            List {
                if store.exercises.isEmpty {
                    emptyState
                } else {
                    exerciseSection
                }
                navigationSection
            }
            .navigationTitle("Today")
        }
    }

    // MARK: - Sections

    private var emptyState: some View {
        VStack(spacing: 6) {
            Image(systemName: "figure.strengthtraining.traditional")
                .font(.title2)
                .foregroundStyle(.secondary)
            Text("No exercises yet")
                .font(.headline)
            Text("Add one below to get started.")
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .listRowBackground(Color.clear)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
    }

    private var exerciseSection: some View {
        Section {
            ForEach(store.exercises) { exercise in
                NavigationLink(destination: LogSetView(exercise: exercise)) {
                    exerciseRow(exercise)
                }
            }
        }
    }

    private func exerciseRow(_ exercise: Exercise) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(exercise.name)
                .font(.body)
            HStack(spacing: 4) {
                Text("\(store.todaySetCount(for: exercise))s")
                Text("·")
                Text("\(store.todayTotalReps(for: exercise))r")
            }
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
        .padding(.vertical, 2)
    }

    private var navigationSection: some View {
        Section {
            NavigationLink(destination: ExercisesView()) {
                Label("Exercises", systemImage: "list.bullet")
            }
            NavigationLink(destination: HistoryView()) {
                Label("History", systemImage: "clock.arrow.circlepath")
            }
            NavigationLink(destination: SettingsView()) {
                Label("Settings", systemImage: "gear")
            }
        }
    }
}
