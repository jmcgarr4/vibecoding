import SwiftUI

struct HistoryView: View {
    @EnvironmentObject var store: Store

    private var groupedSets: [(key: String, value: [SetEntry])] {
        let sorted = store.sets.sorted { $0.timestamp > $1.timestamp }
        let grouped = Dictionary(grouping: sorted) { entry in
            dayLabel(for: entry.timestamp)
        }
        return grouped.sorted { lhs, rhs in
            // Sort groups newest-first by using the first entry's timestamp
            let lDate = grouped[lhs.key]?.first?.timestamp ?? .distantPast
            let rDate = grouped[rhs.key]?.first?.timestamp ?? .distantPast
            return lDate > rDate
        }
    }

    var body: some View {
        List {
            if store.sets.isEmpty {
                Text("No sets logged yet.")
                    .foregroundStyle(.secondary)
                    .listRowBackground(Color.clear)
            } else {
                ForEach(groupedSets, id: \.key) { group in
                    Section(group.key) {
                        ForEach(group.value) { entry in
                            entryRow(entry)
                        }
                    }
                }
            }
        }
        .navigationTitle("History")
    }

    private func entryRow(_ entry: SetEntry) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(exerciseName(for: entry))
                    .font(.body)
                Text(entry.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text("\(entry.reps)r")
                .font(.body.monospacedDigit())
                .foregroundStyle(.secondary)
        }
    }

    private func exerciseName(for entry: SetEntry) -> String {
        store.exercises.first(where: { $0.id == entry.exerciseId })?.name ?? "Deleted"
    }

    private func dayLabel(for date: Date) -> String {
        if Calendar.current.isDateInToday(date) { return "Today" }
        if Calendar.current.isDateInYesterday(date) { return "Yesterday" }
        return date.formatted(.dateTime.weekday(.wide).month().day())
    }
}
