const express = require('express')
const crypto = require('crypto')
const { readJson, writeJson } = require('../utils/jsonStore')
const { requireAuth, allowRoles } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

router.get('/', allowRoles('admin', 'faculty', 'student'), async (_req, res, next) => {
  try { res.json(await readJson('subjects.json', [])) } catch (e) { next(e) }
})

router.post('/', allowRoles('admin'), async (req, res, next) => {
  try {
    const { name, shortName, code, department = 'CSE', facultyId = '' } = req.body
    if (![name, shortName, code].every(v => String(v || '').trim())) {
      return res.status(400).json({ message: 'Subject name, short name and code are required.' })
    }
    const subjects = await readJson('subjects.json', [])
    if (subjects.some(s => s.code.toLowerCase() === code.trim().toLowerCase() || s.shortName.toLowerCase() === shortName.trim().toLowerCase())) {
      return res.status(409).json({ message: 'A subject with that code or short name already exists.' })
    }
    const subject = { id: `SUB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, name: name.trim(), shortName: shortName.trim(), code: code.trim(), department, facultyId }
    subjects.push(subject)
    await writeJson('subjects.json', subjects)
    res.status(201).json(subject)
  } catch (e) { next(e) }
})

router.put('/:id', allowRoles('admin'), async (req, res, next) => {
  try {
    const subjects = await readJson('subjects.json', [])
    const index = subjects.findIndex(s => s.id === req.params.id)
    if (index < 0) return res.status(404).json({ message: 'Subject not found.' })
    for (const key of ['name', 'shortName', 'code', 'department', 'facultyId']) {
      if (req.body[key] !== undefined) subjects[index][key] = String(req.body[key]).trim()
    }
    await writeJson('subjects.json', subjects)
    res.json(subjects[index])
  } catch (e) { next(e) }
})

router.delete('/:id', allowRoles('admin'), async (req, res, next) => {
  try {
    const subjects = await readJson('subjects.json', [])
    const nextSubjects = subjects.filter(s => s.id !== req.params.id)
    if (nextSubjects.length === subjects.length) return res.status(404).json({ message: 'Subject not found.' })
    const attendance = await readJson('attendance.json', [])
    if (attendance.some(a => a.subjectId === req.params.id)) return res.status(409).json({ message: 'This subject has attendance history and cannot be deleted.' })
    await writeJson('subjects.json', nextSubjects)
    res.json({ message: 'Subject deleted.' })
  } catch (e) { next(e) }
})

module.exports = router
