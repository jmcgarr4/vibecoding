import SwiftUI

struct ExercisesView: View {
    @EnvironmentObject var store: Store
    @State private var showingAdd = false

    var body: some View {
        List {
            ForEach(store.exercises) { exercise in
                Text(exercise.name)
            }
            .onDelete { offsets in
                store.deleteExercises(at: offsets)
            }

            Button {
                showingAdd = true
            } label: {
                Label("Add Exercise", systemImage: "plus.circle.fill")
                    .foregroundStyle(.green)
            }
        }
        .navigationTitle("Exercises")
        .sheet(isPresented: $showingAdd) {
            AddExerciseView()
        }
    }
}

struct AddExerciseView: View {
    @EnvironmentObject var store: Store
    @State private var name = ""
    @Environment(\.dismiss) private var dismiss

    private var canSave: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        VStack(spacing: 12) {
            Text("New Exercise")
                .font(.headline)
                .padding(.top, 8)

            TextField("Name", text: $name)
                .textFieldStyle(.plain)
                .multilineTextAlignment(.center)
                .font(.body)
                .submitLabel(.done)
                .onSubmit { saveIfValid() }

            HStack(spacing: 12) {
                Button("Cancel") { dismiss() }
                    .buttonStyle(.bordered)
                    .tint(.secondary)

                Button("Add") { saveIfValid() }
                    .buttonStyle(.borderedProminent)
                    .tint(.green)
                    .disabled(!canSave)
            }
            .padding(.top, 4)
        }
        .padding(.horizontal, 8)
        .padding(.bottom, 8)
    }

    private func saveIfValid() {
        guard canSave else { return }
        store.addExercise(name: name)
        dismiss()
    }
}
