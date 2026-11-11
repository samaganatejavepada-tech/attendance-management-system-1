const bcrypt = require('bcryptjs')
const { readJson, writeJson } = require('../utils/jsonStore')

async function seedData() {
  const users = await readJson('users.json', [])
  if (users.length === 0) {
    const demo = [
      { id: 'USR-ADMIN', name: 'System Administrator', email: 'admin@pscmr.edu.in', role: 'admin', passwordHash: await bcrypt.hash('Admin@123', 10) },
      { id: 'USR-FACULTY', name: 'Faculty Demo', email: 'faculty@pscmr.edu.in', role: 'faculty', facultyId: 'FAC001', passwordHash: await bcrypt.hash('Faculty@123', 10) },
      { id: 'USR-STUDENT', name: 'Rahul Kumar', email: 'student@pscmr.edu.in', role: 'student', studentId: 'STU001', passwordHash: await bcrypt.hash('Student@123', 10) }
    ]
    await writeJson('users.json', demo)
  }

  const students = await readJson('students.json', [])
  if (students.length === 0) {
    await writeJson('students.json', [
      { id: 'STU001', name: 'Rahul Kumar', rollNo: '23CS001', department: 'CSE', year: '3rd Year', section: 'A', email: 'student@pscmr.edu.in' },
      { id: 'STU002', name: 'Priya Sharma', rollNo: '23CS002', department: 'CSE', year: '3rd Year', section: 'A', email: 'priya@pscmr.edu.in' },
      { id: 'STU003', name: 'Arjun Reddy', rollNo: '23CS003', department: 'CSE', year: '3rd Year', section: 'A', email: 'arjun@pscmr.edu.in' },
      { id: 'STU004', name: 'Sneha Rao', rollNo: '23CS004', department: 'CSE', year: '3rd Year', section: 'A', email: 'sneha@pscmr.edu.in' },
      { id: 'STU005', name: 'Kiran Kumar', rollNo: '23CS005', department: 'CSE', year: '3rd Year', section: 'A', email: 'kiran@pscmr.edu.in' }
    ])
  }

  const faculty = await readJson('faculty.json', [])
  if (faculty.length === 0) {
    await writeJson('faculty.json', [
      { id: 'FAC001', name: 'Faculty Demo', department: 'CSE', email: 'faculty@pscmr.edu.in', subjects: ['Web Technologies', 'DBMS'] }
    ])
  }

  const subjects = await readJson('subjects.json', [])
  const requiredSubjects = [
    { id: 'SUB001', name: 'Full Stack Development', shortName: 'FSD', code: 'FSD301', department: 'CSE', facultyId: 'FAC001' },
    { id: 'SUB002', name: 'Data Warehousing and Data Mining', shortName: 'DWDM', code: 'DWDM301', department: 'CSE', facultyId: 'FAC001' },
    { id: 'SUB003', name: 'Mobile Application Development', shortName: 'Flutter', code: 'FLUTTER301', department: 'CSE', facultyId: 'FAC001' },
    { id: 'SUB004', name: 'Software Design', shortName: 'Design', code: 'DESIGN301', department: 'CSE', facultyId: 'FAC001' }
  ]
  // Upgrade legacy demo subjects in-place by ID so existing attendance references remain valid.
  const mergedSubjects = [...subjects]
  for (const subject of requiredSubjects) {
    const existingIndex = mergedSubjects.findIndex(item => item.id === subject.id)
    if (existingIndex >= 0) mergedSubjects[existingIndex] = { ...mergedSubjects[existingIndex], ...subject }
    else if (!mergedSubjects.some(item => item.shortName === subject.shortName)) mergedSubjects.push(subject)
  }
  await writeJson('subjects.json', mergedSubjects)

  // Ensure the demo faculty account can access the complete CSE subject set.
  const currentFaculty = await readJson('faculty.json', [])
  const demoFaculty = currentFaculty.find(item => item.id === 'FAC001')
  if (demoFaculty) {
    demoFaculty.subjects = requiredSubjects.map(item => item.shortName)
    await writeJson('faculty.json', currentFaculty)
  }

  for (const file of ['attendance.json']) {
    const rows = await readJson(file, [])
    if (!Array.isArray(rows)) await writeJson(file, [])
  }
}

module.exports = { seedData }
