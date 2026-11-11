const express = require('express')
const crypto = require('crypto')
const { readJson, writeJson } = require('../utils/jsonStore')
const { requireAuth, allowRoles } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

router.get('/', allowRoles('admin', 'faculty'), async (req, res, next) => {
  try {
    const { date, subjectId } = req.query
    let records = await readJson('attendance.json', [])
    if (date) records = records.filter(r => r.date === date)
    if (subjectId) records = records.filter(r => r.subjectId === subjectId)
    res.json(records)
  } catch (e) { next(e) }
})

router.post('/bulk', allowRoles('admin', 'faculty'), async (req, res, next) => {
  try {
    const { date, subjectId, records } = req.body
    if (!date || !subjectId || !Array.isArray(records) || !records.length) return res.status(400).json({ message: 'Date, subject and attendance records are required.' })
    const students = await readJson('students.json', [])
    const subjects = await readJson('subjects.json', [])
    if (!subjects.some(s => s.id === subjectId)) return res.status(400).json({ message: 'Select a valid subject.' })
    const validStatuses = ['Present', 'Absent', 'On Duty']
    if (records.some(r => !students.some(s => s.id === r.studentId) || !validStatuses.includes(r.status))) return res.status(400).json({ message: 'One or more student IDs or statuses are invalid.' })
    const all = await readJson('attendance.json', [])
    const facultyId = req.session.user.facultyId || req.session.user.id
    for (const item of records) {
      const existingIndex = all.findIndex(r => r.studentId === item.studentId && r.subjectId === subjectId && r.date === date)
      const record = { id: existingIndex >= 0 ? all[existingIndex].id : `ATT-${crypto.randomUUID().slice(0, 8)}`, studentId: item.studentId, subjectId, facultyId, date, status: item.status, updatedAt: new Date().toISOString() }
      if (existingIndex >= 0) all[existingIndex] = record
      else all.push(record)
    }
    await writeJson('attendance.json', all)
    res.json({ message: 'Attendance saved successfully.', count: records.length })
  } catch (e) { next(e) }
})

router.get('/mine', allowRoles('student'), async (req, res, next) => {
  try {
    const all = await readJson('attendance.json', [])
    res.json(all.filter(r => r.studentId === req.session.user.studentId))
  } catch (e) { next(e) }
})

module.exports = router
