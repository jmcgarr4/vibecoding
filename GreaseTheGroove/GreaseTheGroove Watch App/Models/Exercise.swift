import Foundation

struct Exercise: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var lastRepCount: Int

    init(id: UUID = UUID(), name: String, lastRepCount: Int = 1) {
        self.id = id
        self.name = name
        self.lastRepCount = lastRepCount
    }
}
