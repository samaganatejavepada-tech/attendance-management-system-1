const fs = require('fs/promises')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')
const queues = new Map()

async function ensureFile(name, initialValue = []) {
  await fs.mkdir(dataDir, { recursive: true })
  const filePath = path.join(dataDir, name)
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, JSON.stringify(initialValue, null, 2), 'utf8')
  }
  return filePath
}

async function readJson(name, fallback = []) {
  const filePath = await ensureFile(name, fallback)
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`Data file ${name} contains invalid JSON.`)
    throw error
  }
}

// Serialize writes per file so concurrent API requests do not overwrite each other.
async function writeJson(name, value) {
  const previous = queues.get(name) || Promise.resolve()
  const next = previous.then(async () => {
    const filePath = await ensureFile(name)
    const tempPath = `${filePath}.tmp`
    await fs.writeFile(tempPath, JSON.stringify(value, null, 2), 'utf8')
    await fs.rename(tempPath, filePath)
  })
  queues.set(name, next.catch(() => {}))
  return next
}

module.exports = { dataDir, ensureFile, readJson, writeJson }
