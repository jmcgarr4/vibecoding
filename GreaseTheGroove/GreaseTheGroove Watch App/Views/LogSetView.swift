import SwiftUI

struct LogSetView: View {
    @EnvironmentObject var store: Store
    let exercise: Exercise

    @State private var repCount: Int
    @State private var showingTimerChoice = false
    @Environment(\.dismiss) private var dismiss

    init(exercise: Exercise) {
        self.exercise = exercise
        _repCount = State(initialValue: max(1, exercise.lastRepCount))
    }

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            Text("\(repCount)")
                .font(.system(size: 64, weight: .bold, design: .rounded))
                .monospacedDigit()
                .contentTransition(.numericText())
                .animation(.snappy, value: repCount)

            Text(repCount == 1 ? "rep" : "reps")
                .font(.caption)
                .foregroundStyle(.secondary)

            Spacer()

            HStack(spacing: 20) {
                Button {
                    if repCount > 1 {
                        repCount -= 1
                    }
                } label: {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 36))
                        .foregroundStyle(repCount > 1 ? .primary : .tertiary)
                }
                .buttonStyle(.plain)
                .disabled(repCount <= 1)

                Button {
                    repCount += 1
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 36))
                        .foregroundStyle(.green)
                }
                .buttonStyle(.plain)
            }
            .padding(.bottom, 12)

            Button("Done") {
                store.logSet(exercise: exercise, reps: repCount)
                showingTimerChoice = true
            }
            .buttonStyle(.borderedProminent)
            .tint(.green)
        }
        .navigationTitle(exercise.name)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showingTimerChoice, onDismiss: { dismiss() }) {
            TimerChoiceView()
        }
    }
}
