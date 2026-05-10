import Foundation

struct SetEntry: Identifiable, Codable {
    let id: UUID
    let exerciseId: UUID
    let reps: Int
    let timestamp: Date

    init(id: UUID = UUID(), exerciseId: UUID, reps: Int, timestamp: Date = Date()) {
        self.id = id
        self.exerciseId = exerciseId
        self.reps = reps
        self.timestamp = timestamp
    }
}
