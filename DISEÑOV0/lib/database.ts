import 'server-only'

import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

// SQLite queda como legado local del bootstrap previo. La fuente principal del MVP
// ahora es Supabase y este archivo se conserva solo como referencia/fallback temporal.
declare global {
  var inmobiaDatabase: DatabaseSync | undefined
  var inmobiaDatabaseInitialized: boolean | undefined
}

const databaseDirectory = path.join(process.cwd(), '.data')
const databasePath = path.join(databaseDirectory, 'inmobia.sqlite')
const migrationsDirectory = path.join(process.cwd(), 'db', 'migrations')

function initializeDatabase(database: DatabaseSync) {
  database.exec('PRAGMA foreign_keys = ON;')
  database.exec('PRAGMA journal_mode = WAL;')
  database.exec('PRAGMA synchronous = NORMAL;')

  if (!fs.existsSync(migrationsDirectory)) {
    return
  }

  const migrationFiles = fs
    .readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDirectory, file), 'utf8')
    database.exec(sql)
  }
}

export function getDatabase() {
  if (!globalThis.inmobiaDatabase) {
    fs.mkdirSync(databaseDirectory, { recursive: true })
    globalThis.inmobiaDatabase = new DatabaseSync(databasePath)
  }

  if (!globalThis.inmobiaDatabaseInitialized) {
    initializeDatabase(globalThis.inmobiaDatabase)
    globalThis.inmobiaDatabaseInitialized = true
  }

  return globalThis.inmobiaDatabase
}

export function getDatabasePath() {
  return databasePath
}
