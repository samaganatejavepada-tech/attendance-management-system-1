const express = require('express')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { readJson, writeJson } = require('../utils/jsonStore')
const { requireAuth, allowRoles } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

router.get('/', allowRoles('admin', 'faculty'), async (_req, res, next) => {
  try { res.json(await readJson('students.json', [])) } catch (e) { next(e) }
})

router.post('/', allowRoles('admin'), async (req, res, next) => {
  try {
    const { name, rollNo, department, year, section, email } = req.body
    if (![name, rollNo, department, year, section].every(v => String(v || '').trim())) return res.status(400).json({ message: 'Name, roll number, department, year and section are required.' })
    const students = await readJson('students.json', [])
    if (students.some(s => s.rollNo.toLowerCase() === rollNo.trim().toLowerCase())) return res.status(409).json({ message: 'That roll number already exists.' })
    const student = { id: `STU-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, name: name.trim(), rollNo: rollNo.trim(), department, year, section, email: (email || '').trim() }
    students.push(student)
    await writeJson('students.json', students)
    if (student.email) {
      const users = await readJson('users.json', [])
      if (users.some(u => u.email.toLowerCase() === student.email.toLowerCase())) {
        students.pop()
        await writeJson('students.json', students)
        return res.status(409).json({ message: 'That email already belongs to an account.' })
      }
      users.push({
        id: `USR-${student.id}`,
        name: student.name,
        email: student.email,
        role: 'student',
        studentId: student.id,
        passwordHash: await bcrypt.hash('Student@123', 10)
      })
      await writeJson('users.json', users)
    }
    res.status(201).json({ ...student, loginCreated: Boolean(student.email), defaultPassword: student.email ? 'Student@123' : null })
  } catch (e) { next(e) }
})

router.put('/:id', allowRoles('admin'), async (req, res, next) => {
  try {
    const students = await readJson('students.json', [])
    const index = students.findIndex(s => s.id === req.params.id)
    if (index < 0) return res.status(404).json({ message: 'Student not found.' })
    const allowed = ['name', 'rollNo', 'department', 'year', 'section', 'email']
    for (const key of allowed) if (req.body[key] !== undefined) students[index][key] = String(req.body[key]).trim()
    await writeJson('students.json', students)
    res.json(students[index])
  } catch (e) { next(e) }
})

router.delete('/:id', allowRoles('admin'), async (req, res, next) => {
  try {
    const students = await readJson('students.json', [])
    const nextStudents = students.filter(s => s.id !== req.params.id)
    if (nextStudents.length === students.length) return res.status(404).json({ message: 'Student not found.' })
    await writeJson('students.json', nextStudents)
    const attendance = await readJson('attendance.json', [])
    await writeJson('attendance.json', attendance.filter(a => a.studentId !== req.params.id))
    const users = await readJson('users.json', [])
    await writeJson('users.json', users.filter(u => u.studentId !== req.params.id))
    res.json({ message: 'Student and linked demo records deleted.' })
  } catch (e) { next(e) }
})

module.exports = router
