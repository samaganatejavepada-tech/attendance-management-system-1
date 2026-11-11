const express = require('express')
const bcrypt = require('bcryptjs')
const { readJson } = require('../utils/jsonStore')

const router = express.Router()

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })
    const users = await readJson('users.json', [])
    const user = users.find(item => item.email.toLowerCase() === String(email).trim().toLowerCase())
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, studentId: user.studentId || null, facultyId: user.facultyId || null }
    res.json({ user: req.session.user })
  } catch (error) { next(error) }
})

router.get('/me', (req, res) => {
  res.json({ user: req.session.user || null })
})

router.post('/logout', (req, res) => {
  req.session.destroy(error => {
    if (error) return res.status(500).json({ message: 'Could not end session.' })
    res.clearCookie('pscmr.sid')
    res.json({ message: 'Signed out successfully.' })
  })
})

module.exports = router
