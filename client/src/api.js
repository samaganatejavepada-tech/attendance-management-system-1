const API = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Request failed.')
  return data
}

export const api = {
  me: () => request('/auth/me'),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  students: () => request('/students'),
  addStudent: data => request('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: id => request(`/students/${id}`, { method: 'DELETE' }),
  faculty: () => request('/faculty'),
  addFaculty: data => request('/faculty', { method: 'POST', body: JSON.stringify(data) }),
  deleteFaculty: id => request(`/faculty/${id}`, { method: 'DELETE' }),
  subjects: () => request('/subjects'),
  addSubject: data => request('/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: (id, data) => request(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubject: id => request(`/subjects/${id}`, { method: 'DELETE' }),
  attendance: date => request(`/attendance${date ? `?date=${date}` : ''}`),
  saveAttendance: data => request('/attendance/bulk', { method: 'POST', body: JSON.stringify(data) }),
  myAttendance: () => request('/attendance/mine'),
  summary: () => request('/reports/summary'),
  exportRows: () => request('/reports/export')
}
