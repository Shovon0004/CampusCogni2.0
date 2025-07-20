import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("Testing MongoDB connection...")

    const db = await getDatabase()

    // Test basic connection
    const adminDb = db.admin()
    const result = await adminDb.ping()
    console.log("MongoDB ping successful")

    // Get database stats
    const stats = await db.stats()

    // List collections
    const collections = await db.listCollections().toArray()

    // Count documents in each collection
    const collectionCounts: Record<string, number> = {}
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments()
        collectionCounts[collection.name] = count
      } catch (error) {
        collectionCounts[collection.name] = 0
      }
    }

    return NextResponse.json({
      success: true,
      connection: "OK",
      database: db.databaseName,
      collections: collections.map((c) => c.name),
      collection_counts: collectionCounts,
      database_size: stats.dataSize,
      storage_size: stats.storageSize,
      indexes: stats.indexes,
    })
  } catch (error) {
    console.error("MongoDB test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        connection: "FAILED",
      },
      { status: 500 },
    )
  }
}
