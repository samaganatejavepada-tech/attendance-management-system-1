const express = require('express')
const { readJson } = require('../utils/jsonStore')
const { requireAuth, allowRoles } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

router.get('/summary', allowRoles('admin', 'faculty'), async (_req, res, next) => {
  try {
    const [students, faculty, attendance] = await Promise.all([
      readJson('students.json', []), readJson('faculty.json', []), readJson('attendance.json', [])
    ])
    const today = new Date().toISOString().slice(0, 10)
    const todays = attendance.filter(r => r.date === today)
    const present = todays.filter(r => r.status === 'Present').length
    const absent = todays.filter(r => r.status === 'Absent').length
    res.json({ totalStudents: students.length, totalFaculty: faculty.length, todayPresent: present, todayAbsent: absent, todayMarked: todays.length, overallRecords: attendance.length })
  } catch (e) { next(e) }
})

router.get('/export', allowRoles('admin', 'faculty'), async (_req, res, next) => {
  try {
    const [attendance, students, subjects] = await Promise.all([
      readJson('attendance.json', []), readJson('students.json', []), readJson('subjects.json', [])
    ])
    const rows = attendance.map(r => ({
      date: r.date,
      rollNo: students.find(s => s.id === r.studentId)?.rollNo || '',
      student: students.find(s => s.id === r.studentId)?.name || 'Deleted student',
      subject: subjects.find(s => s.id === r.subjectId)?.name || 'Unknown subject',
      status: r.status
    }))
    res.json(rows)
  } catch (e) { next(e) }
})

router.get('/subjects', allowRoles('admin', 'faculty', 'student'), async (_req, res, next) => {
  try { res.json(await readJson('subjects.json', [])) } catch (e) { next(e) }
})

module.exports = router
