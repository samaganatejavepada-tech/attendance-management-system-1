const express = require('express')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { readJson, writeJson } = require('../utils/jsonStore')
const { requireAuth, allowRoles } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth, allowRoles('admin'))

router.get('/', async (_req, res, next) => {
  try { res.json(await readJson('faculty.json', [])) } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, department, email, subjects = [], password = 'Faculty@123' } = req.body
    if (![name, department, email].every(v => String(v || '').trim())) return res.status(400).json({ message: 'Name, department and email are required.' })
    const faculty = await readJson('faculty.json', [])
    const users = await readJson('users.json', [])
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) return res.status(409).json({ message: 'Email already exists.' })
    const id = `FAC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const record = { id, name: name.trim(), department, email: email.trim(), subjects: Array.isArray(subjects) ? subjects : [] }
    faculty.push(record)
    users.push({ id: `USR-${id}`, name: record.name, email: record.email, role: 'faculty', facultyId: id, passwordHash: await bcrypt.hash(password, 10) })
    await writeJson('faculty.json', faculty)
    await writeJson('users.json', users)
    res.status(201).json(record)
  } catch (e) { next(e) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const faculty = await readJson('faculty.json', [])
    const nextFaculty = faculty.filter(f => f.id !== req.params.id)
    if (nextFaculty.length === faculty.length) return res.status(404).json({ message: 'Faculty member not found.' })
    await writeJson('faculty.json', nextFaculty)
    const users = await readJson('users.json', [])
    await writeJson('users.json', users.filter(u => u.facultyId !== req.params.id))
    res.json({ message: 'Faculty member deleted.' })
  } catch (e) { next(e) }
})

module.exports = router
