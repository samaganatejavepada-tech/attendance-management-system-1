const express = require('express')
const session = require('express-session')
const cors = require('cors')
const path = require('path')
const { seedData } = require('./controllers/seed')
const authRoutes = require('./routes/authRoutes')
const studentRoutes = require('./routes/studentRoutes')
const facultyRoutes = require('./routes/facultyRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')
const reportRoutes = require('./routes/reportRoutes')
const subjectRoutes = require('./routes/subjectRoutes')
const { ensureFile } = require('./utils/jsonStore')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(session({
  name: 'pscmr.sid',
  secret: process.env.SESSION_SECRET || 'local-college-demo-change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 8 * 60 * 60 * 1000 }
}))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', storage: 'local-json-files', database: false }))
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/faculty', facultyRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/subjects', subjectRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Server error. Check the terminal for details.' })
})

async function start() {
  await Promise.all(['users.json','students.json','faculty.json','subjects.json','attendance.json'].map(name => ensureFile(name, [])))
  await seedData()
  app.listen(PORT, () => console.log(`PSCMR API running at http://localhost:${PORT}`))
}
start().catch(error => { console.error('Could not start server:', error); process.exit(1) })
