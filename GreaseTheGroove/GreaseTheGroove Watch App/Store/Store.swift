import Foundation
import Combine

final class Store: ObservableObject {
    @Published var exercises: [Exercise] = []
    @Published var sets: [SetEntry] = []
    @Published var settings: AppSettings = .default

    private let exercisesKey = "gtg.exercises"
    private let setsKey = "gtg.sets"
    private let settingsKey = "gtg.settings"

    init() {
        load()
        pruneOldSets()
    }

    // MARK: - Computed

    func todaySets(for exercise: Exercise) -> [SetEntry] {
        let start = Calendar.current.startOfDay(for: Date())
        return sets.filter { $0.exerciseId == exercise.id && $0.timestamp >= start }
    }

    func todaySetCount(for exercise: Exercise) -> Int {
        todaySets(for: exercise).count
    }

    func todayTotalReps(for exercise: Exercise) -> Int {
        todaySets(for: exercise).reduce(0) { $0 + $1.reps }
    }

    // MARK: - Exercises

    func addExercise(name: String) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        exercises.append(Exercise(name: trimmed))
        saveExercises()
    }

    func deleteExercises(at offsets: IndexSet) {
        exercises.remove(atOffsets: offsets)
        saveExercises()
    }

    // MARK: - Sets

    func logSet(exercise: Exercise, reps: Int) {
        if let index = exercises.firstIndex(where: { $0.id == exercise.id }) {
            exercises[index].lastRepCount = reps
            saveExercises()
        }
        sets.append(SetEntry(exerciseId: exercise.id, reps: reps))
        saveSets()
    }

    func pruneOldSets() {
        let cutoff = Date().addingTimeInterval(-7 * 24 * 3600)
        let before = sets.count
        sets = sets.filter { $0.timestamp > cutoff }
        if sets.count != before { saveSets() }
    }

    // MARK: - Settings

    func saveSettings() {
        guard let data = try? JSONEncoder().encode(settings) else { return }
        UserDefaults.standard.set(data, forKey: settingsKey)
    }

    // MARK: - Persistence

    private func load() {
        if let data = UserDefaults.standard.data(forKey: exercisesKey),
           let decoded = try? JSONDecoder().decode([Exercise].self, from: data) {
            exercises = decoded
        }
        if let data = UserDefaults.standard.data(forKey: setsKey),
           let decoded = try? JSONDecoder().decode([SetEntry].self, from: data) {
            sets = decoded
        }
        if let data = UserDefaults.standard.data(forKey: settingsKey),
           let decoded = try? JSONDecoder().decode(AppSettings.self, from: data) {
            settings = decoded
        }
    }

    private func saveExercises() {
        guard let data = try? JSONEncoder().encode(exercises) else { return }
        UserDefaults.standard.set(data, forKey: exercisesKey)
    }

    private func saveSets() {
        guard let data = try? JSONEncoder().encode(sets) else { return }
        UserDefaults.standard.set(data, forKey: setsKey)
    }
}
