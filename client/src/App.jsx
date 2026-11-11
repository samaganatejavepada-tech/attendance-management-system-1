import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, BookOpen, CalendarDays, ChartNoAxesColumn, Check, ChevronRight,
  ClipboardCheck, Download, GraduationCap, LayoutDashboard, LogOut, Menu,
  Plus, Search, ShieldCheck, Trash2, Users, X, Building2, UserRound
} from 'lucide-react'
import { api } from './api'

const AuthContext = createContext(null)
const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  useEffect(() => { api.me().then(r => setUser(r.user)).catch(() => {}).finally(() => setChecking(false)) }, [])
  const value = useMemo(() => ({
    user,
    login: async (email, password) => { const r = await api.login(email, password); setUser(r.user); return r.user },
    logout: async () => { await api.logout(); setUser(null) }
  }), [user])
  if (checking) return <div className="boot-screen"><div className="boot-logo"><GraduationCap/></div><strong>PSCMR AttendEase</strong><span>Preparing your workspace…</span></div>
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email,setEmail] = useState('admin@pscmr.edu.in')
  const [password,setPassword] = useState('Admin@123')
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true)
    try { await login(email,password); navigate('/') } catch(err) { setError(err.message) } finally { setBusy(false) }
  }
  return <div className="login-page">
    <section className="login-visual">
      <div className="brand brand-white"><span className="brand-icon"><GraduationCap/></span><span>PSCMR <b>AttendEase</b></span></div>
      <div className="visual-copy"><span className="eyebrow light">SMART CAMPUS · DIGITAL ATTENDANCE</span><h1>Every class.<br/><em>Every record.</em><br/>One place.</h1><p>A connected attendance workspace for administrators, faculty and students at PSCMR College.</p><div className="visual-points"><span><Check/> Clear attendance insights</span><span><Check/> Simple faculty workflows</span><span><Check/> Student visibility</span></div></div>
      <div className="visual-foot">PSCMR COLLEGE · ATTENDANCE MANAGEMENT SYSTEM</div>
    </section>
    <section className="login-side"><form className="login-card" onSubmit={submit}>
      <div className="login-symbol"><ShieldCheck/></div><span className="eyebrow">WELCOME TO PSCMR</span><h2>Sign in to continue</h2><p className="muted">Use your assigned college account.</p>
      <label>Email address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@pscmr.edu.in" required/>
      <label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required/>
      {error&&<div className="error">{error}</div>}
      <button className="btn primary wide" disabled={busy}>{busy?'Signing in…':'Sign in'} <ChevronRight size={17}/></button>
      <div className="demo-credentials"><strong>Demo credentials</strong><button type="button" onClick={()=>{setEmail('admin@pscmr.edu.in');setPassword('Admin@123')}}>Admin <code>admin@pscmr.edu.in · Admin@123</code></button><button type="button" onClick={()=>{setEmail('faculty@pscmr.edu.in');setPassword('Faculty@123')}}>Faculty <code>faculty@pscmr.edu.in · Faculty@123</code></button><button type="button" onClick={()=>{setEmail('student@pscmr.edu.in');setPassword('Student@123')}}>Student <code>student@pscmr.edu.in · Student@123</code></button></div>
      <small className="security-note"><ShieldCheck size={13}/> Local demonstration · JSON-file storage · No database</small>
    </form></section>
  </div>
}

function Protected({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace/>
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace/>
  return children
}

function Shell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobile,setMobile] = useState(false)
  const [error,setError] = useState('')
  const nav = user.role === 'admin'
    ? [{to:'/',label:'Overview',icon:LayoutDashboard},{to:'/students',label:'Students',icon:Users},{to:'/faculty',label:'Faculty',icon:UserRound},{to:'/subjects',label:'Subjects',icon:BookOpen},{to:'/attendance',label:'Attendance',icon:ClipboardCheck},{to:'/reports',label:'Reports',icon:ChartNoAxesColumn},{to:'/settings',label:'Settings',icon:ShieldCheck}]
    : user.role === 'faculty'
      ? [{to:'/',label:'Overview',icon:LayoutDashboard},{to:'/subjects',label:'My subjects',icon:BookOpen},{to:'/attendance',label:'Mark attendance',icon:ClipboardCheck},{to:'/reports',label:'Reports',icon:ChartNoAxesColumn},{to:'/settings',label:'Settings',icon:ShieldCheck}]
      : [{to:'/',label:'My attendance',icon:LayoutDashboard},{to:'/subjects',label:'Subjects',icon:BookOpen},{to:'/reports',label:'Subject reports',icon:ChartNoAxesColumn},{to:'/profile',label:'Profile',icon:UserRound}]
  const titles = {'/':'Overview','/students':'Students','/faculty':'Faculty','/subjects':'Subjects','/attendance':'Attendance','/reports':'Reports','/settings':'Settings','/profile':'Profile'}
  const title = titles[location.pathname] || 'Overview'
  async function signOut() { try { await logout() } catch(e) { setError(e.message) } }
  return <div className="app-shell">
    <aside className={`sidebar ${mobile?'open':''}`}>
      <div className="brand"><span className="brand-icon"><GraduationCap/></span><span>PSCMR <b>AttendEase</b></span></div>
      <div className="college-caption">COLLEGE ATTENDANCE PORTAL</div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>{nav.map(item=><NavLink key={item.to} end={item.to==='/'} to={item.to} onClick={()=>setMobile(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`}><item.icon size={18}/><span>{item.label}</span>{item.to==='/attendance'&&<i/>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="storage-chip"><ShieldCheck size={16}/><span><b>Local JSON storage</b><small>No database connected</small></span></div><button className="account-row" onClick={signOut}><div className="avatar">{user.name[0]}</div><span><b>{user.name}</b><small>{user.role}</small></span><LogOut size={16}/></button></div>
    </aside>
    {mobile&&<button className="scrim" onClick={()=>setMobile(false)} aria-label="Close navigation"/>}
    <main className="main">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={()=>setMobile(true)}><Menu/></button><div><div className="crumb">Workspace <span>/</span> {title}</div><h1>{title}</h1></div><div className="top-actions"><div className="date-tag"><CalendarDays size={15}/>{new Date().toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}</div><div className="avatar">{user.name[0]}</div></div></header>
      {error&&<div className="error page-error">{error}</div>}
      <div className="page">
        <Routes>
          <Route path="/" element={user.role==='student'?<StudentHome/>:<Dashboard/>}/>
          <Route path="/students" element={<Protected roles={['admin']}><StudentsPage/></Protected>}/>
          <Route path="/faculty" element={<Protected roles={['admin']}><FacultyPage/></Protected>}/>
          <Route path="/subjects" element={<SubjectsPage/>}/>
          <Route path="/attendance" element={<Protected roles={['admin','faculty']}><AttendancePage/></Protected>}/>
          <Route path="/reports" element={user.role==='student'?<StudentReportsPage/>:<Protected roles={['admin','faculty']}><ReportsPage/></Protected>}/>
          <Route path="/settings" element={<Protected roles={['admin']}><SettingsPage/></Protected>}/>
          <Route path="/profile" element={<Protected roles={['student']}><ProfilePage/></Protected>}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </div>
      <footer className="footer"><span>© {new Date().getFullYear()} PSCMR AttendEase</span><span>Attendance Management System <i/> Educational demonstration</span></footer>
    </main>
  </div>
}

function Stat({label,value,note,icon:Icon,tone}) {
  return <div className="stat"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
}
function Dashboard() {
  const {user}=useAuth()
  const [summary,setSummary]=useState(null)
  const [students,setStudents]=useState([])
  const [subjects,setSubjects]=useState([])
  const [err,setErr]=useState('')
  useEffect(()=>{Promise.all([api.summary(),api.students(),api.subjects()]).then(([s,st,sub])=>{setSummary(s);setStudents(st);setSubjects(sub)}).catch(e=>setErr(e.message))},[])
  if(err)return <div className="notice error">{err}</div>
  const s=summary||{}
  return <div className="stack">
    <div className="welcome"><div><span className="eyebrow">PSCMR COLLEGE · ACADEMIC WORKSPACE</span><h2>Good day, {user.name.split(' ')[0]} <em>✦</em></h2><p>Here is your attendance overview for today.</p></div><span className="pill"><i/> Academic year 2026–27</span></div>
    <div className="stats-grid five"><Stat label="Total students" value={s.totalStudents??'—'} note="Registered students" icon={Users} tone="blue"/><Stat label="Total faculty" value={s.totalFaculty??'—'} note="Faculty directory" icon={UserRound} tone="violet"/><Stat label="Total subjects" value={subjects.length} note="Active subject catalogue" icon={BookOpen} tone="blue"/><Stat label="Present today" value={s.todayPresent??0} note="Attendance entries" icon={Check} tone="green"/><Stat label="Absent today" value={s.todayAbsent??0} note="Attendance entries" icon={Activity} tone="orange"/></div>
    <div className="two-col">
      <section className="panel"><div className="panel-head"><div><h3>Attendance snapshot</h3><p>Today's submitted attendance entries</p></div><span className="soft-tag">{s.todayMarked||0} marked</span></div><div className="snapshot"><div className="ring" style={{'--value':`${s.todayMarked?Math.round((s.todayPresent||0)/s.todayMarked*100):0}%`}}><div><b>{s.todayMarked?`${Math.round((s.todayPresent||0)/s.todayMarked*100)}%`:'—'}</b><small>Present rate</small></div></div><div className="legend"><span><i className="green-dot"/>Present <b>{s.todayPresent||0}</b></span><span><i className="orange-dot"/>Absent <b>{s.todayAbsent||0}</b></span><span><i className="gray-dot"/>Total records <b>{s.todayMarked||0}</b></span></div></div></section>
      <section className="panel"><div className="panel-head"><div><h3>Quick actions</h3><p>Common workspace tasks</p></div></div><div className="quick-list"><a href="/attendance"><span className="quick-icon blue"><ClipboardCheck/></span><span><b>Mark attendance</b><small>Record class attendance</small></span><ChevronRight/></a>{user.role==='admin'&&<a href="/students"><span className="quick-icon violet"><Users/></span><span><b>Manage students</b><small>Update student directory</small></span><ChevronRight/></a>}<a href="/reports"><span className="quick-icon orange"><ChartNoAxesColumn/></span><span><b>Attendance reports</b><small>Review attendance data</small></span><ChevronRight/></a></div></section>
    </div>
    <section className="panel"><div className="panel-head"><div><h3>Subject catalogue</h3><p>Attendance tracking is configured independently for each subject</p></div><a className="link" href="/subjects">Manage subjects →</a></div><div className="subject-grid">{subjects.map(subject=><div className="subject-card" key={subject.id}><span className="subject-code">{subject.shortName || subject.code}</span><h4>{subject.name}</h4><p>{subject.code}</p></div>)}</div></section>
    <section className="panel"><div className="panel-head"><div><h3>Student directory preview</h3><p>Recently available student records</p></div><a className="link" href="/students">Manage students →</a></div><div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>ROLL NUMBER</th><th>DEPARTMENT</th><th>YEAR</th><th>SECTION</th></tr></thead><tbody>{students.slice(0,5).map(st=><tr key={st.id}><td className="person"><span className="avatar small">{st.name[0]}</span><b>{st.name}</b></td><td>{st.rollNo}</td><td>{st.department}</td><td>{st.year}</td><td>{st.section}</td></tr>)}</tbody></table>{!students.length&&<Empty title="No student records" text="Add students to populate the directory."/>}</div></section>
  </div>
}

function StudentsPage() {
  const [students,setStudents]=useState([])
  const [query,setQuery]=useState('')
  const [modal,setModal]=useState(false)
  const [editing,setEditing]=useState(null)
  const [error,setError]=useState('')
  const [form,setForm]=useState({name:'',rollNo:'',department:'CSE',year:'3rd Year',section:'A',email:''})
  const load=()=>api.students().then(setStudents).catch(e=>setError(e.message))
  useEffect(()=>{load()},[])
  const filtered=students.filter(s=>`${s.name} ${s.rollNo} ${s.department}`.toLowerCase().includes(query.toLowerCase()))
  function openAdd(){setEditing(null);setForm({name:'',rollNo:'',department:'CSE',year:'3rd Year',section:'A',email:''});setModal(true)}
  function openEdit(s){setEditing(s.id);setForm({...s});setModal(true)}
  async function save(e){e.preventDefault();setError('');try{if(editing)await api.updateStudent(editing,form);else await api.addStudent(form);setModal(false);load()}catch(e){setError(e.message)}}
  async function remove(s){if(!confirm(`Delete ${s.name}?`))return;try{await api.deleteStudent(s.id);load()}catch(e){setError(e.message)}}
  return <div className="stack"><div className="toolbar"><div className="search"><Search size={17}/><input placeholder="Search name, roll number or department…" value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="btn primary" onClick={openAdd}><Plus size={16}/> Add student</button></div>{error&&<div className="notice error">{error}</div>}<section className="panel"><div className="panel-head"><div><h3>Student directory</h3><p>{students.length} registered student records</p></div><span className="soft-tag">All departments</span></div><div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>ROLL NUMBER</th><th>DEPARTMENT</th><th>YEAR</th><th>SECTION</th><th>ACTIONS</th></tr></thead><tbody>{filtered.map(s=><tr key={s.id}><td className="person"><span className="avatar small">{s.name[0]}</span><span><b>{s.name}</b><small>{s.email||'—'}</small></span></td><td>{s.rollNo}</td><td>{s.department}</td><td>{s.year}</td><td>{s.section}</td><td><div className="actions"><button className="icon-button" onClick={()=>openEdit(s)} title="Edit">✎</button><button className="icon-button danger" onClick={()=>remove(s)} title="Delete"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{!filtered.length&&<Empty title="No students found" text="Change your search or add a student."/>}</div></section>{modal&&<Modal title={editing?'Edit student':'Add student'} close={()=>setModal(false)}><form className="form-grid" onSubmit={save}>{[['name','Full name'],['rollNo','Roll number'],['email','Email']].map(([key,label])=><label key={key}>{label}<input required={key!=='email'} type={key==='email'?'email':'text'} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}<label>Department<select value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>{['CSE','ECE','EEE','IT','MECH','CIVIL'].map(x=><option>{x}</option>)}</select></label><label>Academic year<select value={form.year} onChange={e=>setForm({...form,year:e.target.value})}>{['1st Year','2nd Year','3rd Year','4th Year'].map(x=><option>{x}</option>)}</select></label><label>Section<select value={form.section} onChange={e=>setForm({...form,section:e.target.value})}>{['A','B','C','D'].map(x=><option>{x}</option>)}</select></label><div className="modal-actions"><button type="button" className="btn secondary" onClick={()=>setModal(false)}>Cancel</button><button className="btn primary">{editing?'Save changes':'Add student'}</button></div></form></Modal>}</div>
}

function FacultyPage() {
  const [faculty,setFaculty]=useState([])
  const [form,setForm]=useState({name:'',department:'CSE',email:'',password:'Faculty@123'})
  const [error,setError]=useState('')
  const load=()=>api.faculty().then(setFaculty).catch(e=>setError(e.message))
  useEffect(()=>{load()},[])
  async function add(e){e.preventDefault();setError('');try{await api.addFaculty({...form,subjects:[]});setForm({name:'',department:'CSE',email:'',password:'Faculty@123'});load()}catch(e){setError(e.message)}}
  async function remove(f){if(!confirm(`Remove ${f.name}?`))return;try{await api.deleteFaculty(f.id);load()}catch(e){setError(e.message)}}
  return <div className="stack"><section className="panel"><div className="panel-head"><div><h3>Add faculty member</h3><p>Create faculty profile and demo login account</p></div></div><form className="faculty-form" onSubmit={add}><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Department<select value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>{['CSE','ECE','EEE','IT','MECH','CIVIL'].map(x=><option>{x}</option>)}</select></label><label>Temporary password<input required minLength="8" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><button className="btn primary"><Plus size={16}/> Add faculty</button></form>{error&&<p className="error-text">{error}</p>}</section><section className="panel"><div className="panel-head"><div><h3>Faculty directory</h3><p>{faculty.length} faculty members</p></div></div><div className="table-scroll"><table><thead><tr><th>FACULTY</th><th>DEPARTMENT</th><th>EMAIL</th><th>ACTIONS</th></tr></thead><tbody>{faculty.map(f=><tr key={f.id}><td className="person"><span className="avatar small">{f.name[0]}</span><b>{f.name}</b></td><td>{f.department}</td><td>{f.email}</td><td><button className="icon-button danger" onClick={()=>remove(f)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></section></div>
}


function SubjectsPage() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', shortName: '', code: '', department: 'CSE' })
  const [busy, setBusy] = useState(false)
  const load = () => api.subjects().then(setSubjects).catch(e => setError(e.message))
  useEffect(() => { load() }, [])
  async function add(e) {
    e.preventDefault(); setError(''); setBusy(true)
    try { await api.addSubject(form); setForm({ name: '', shortName: '', code: '', department: 'CSE' }); await load() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function remove(subject) {
    if (!confirm(`Delete ${subject.name}? Subjects with attendance history cannot be deleted.`)) return
    try { await api.deleteSubject(subject.id); await load() } catch (e) { setError(e.message) }
  }
  return <div className="stack">
    <div className="welcome"><div><span className="eyebrow">ACADEMIC CATALOGUE</span><h2>{user.role === 'student' ? 'Your subjects' : user.role === 'faculty' ? 'My subjects' : 'Subject management'}</h2><p>All attendance and reporting is tracked independently for each subject.</p></div><span className="pill">{subjects.length} active subjects</span></div>
    {error && <div className="notice error">{error}</div>}
    {user.role === 'admin' && <section className="panel"><div className="panel-head"><div><h3>Add a subject</h3><p>Create a subject for attendance tracking</p></div></div><form className="faculty-form" onSubmit={add}>
      <label>Subject name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full Stack Development"/></label>
      <label>Short name<input required value={form.shortName} onChange={e=>setForm({...form,shortName:e.target.value})} placeholder="FSD"/></label>
      <label>Subject code<input required value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="FSD301"/></label>
      <label>Department<select value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>{['CSE','ECE','EEE','IT','MECH','CIVIL'].map(x=><option key={x}>{x}</option>)}</select></label>
      <button className="btn primary" disabled={busy}><Plus size={16}/>{busy?'Adding…':'Add subject'}</button>
    </form></section>}
    <div className="subject-grid">{subjects.map(subject=><article className="subject-card" key={subject.id}><span className="subject-code">{subject.shortName || subject.code}</span><h4>{subject.name}</h4><p>{subject.code} · {subject.department || 'CSE'}</p>{user.role==='admin'&&<div className="subject-actions"><button className="icon-button danger" title="Delete subject" onClick={()=>remove(subject)}><Trash2 size={15}/></button></div>}</article>)}</div>
  </div>
}

function AttendancePage() {
  const [students,setStudents]=useState([])
  const [subjects,setSubjects]=useState([])
  const [records,setRecords]=useState({})
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const [subjectId,setSubjectId]=useState('')
  const [filter,setFilter]=useState('All')
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  useEffect(()=>{Promise.all([api.students(),api.subjects()]).then(([s,sub])=>{setStudents(s);setSubjects(sub);if(sub[0])setSubjectId(sub[0].id)}).catch(e=>setError(e.message))},[])
  useEffect(()=>{if(subjectId&&date)api.attendance(date).then(rows=>{const obj={};rows.filter(r=>r.subjectId===subjectId).forEach(r=>obj[r.studentId]=r.status);setRecords(obj)}).catch(e=>setError(e.message))},[subjectId,date])
  const present=Object.values(records).filter(v=>v==='Present').length
  const absent=Object.values(records).filter(v=>v==='Absent').length
  const onDuty=Object.values(records).filter(v=>v==='On Duty').length
  const visible=students.filter(s=>filter==='All'||records[s.id]===filter||(filter==='Not marked'&&!records[s.id]))
  function mark(id,status){setRecords(prev=>({...prev,[id]:status}));setMessage('')}
  async function save(){setError('');setMessage('');try{const payload=students.filter(s=>records[s.id]).map(s=>({studentId:s.id,status:records[s.id]}));if(!payload.length)throw new Error('Mark at least one student before saving.');const result=await api.saveAttendance({date,subjectId,records:payload});setMessage(`${result.count} attendance records saved successfully.`)}catch(e){setError(e.message)}}
  return <div className="stack"><section className="panel attendance-controls"><label>Attendance date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Subject<select value={subjectId} onChange={e=>setSubjectId(e.target.value)}>{subjects.map(s=><option value={s.id}>{s.name} ({s.code})</option>)}</select></label><div className="counts"><span className="green-text">{present} Present</span><span className="orange-text">{absent} Absent</span><span className="violet-text">{onDuty} On Duty</span></div></section>{error&&<div className="notice error">{error}</div>}{message&&<div className="notice success">{message}</div>}<div className="attendance-toolbar"><div><h3>Class attendance</h3><p>Mark a status for each student. Existing records for this subject and date are updated.</p></div><div className="button-row"><button className="btn secondary small" onClick={()=>setRecords(Object.fromEntries(students.map(s=>[s.id,'Present'])))}>All present</button><button className="btn secondary small" onClick={()=>setRecords(Object.fromEntries(students.map(s=>[s.id,'Absent'])))}>All absent</button></div></div><div className="filters">{['All','Present','Absent','On Duty','Not marked'].map(x=><button className={filter===x?'selected':''} onClick={()=>setFilter(x)}>{x}</button>)}</div><section className="panel attendance-list">{visible.map(s=><div className="attendance-row" key={s.id}><div className="person"><span className="avatar small">{s.name[0]}</span><span><b>{s.name}</b><small>{s.rollNo} · {s.department} · Section {s.section}</small></span></div><div className="mark-buttons">{['Present','Absent','On Duty'].map(status=><button className={`${status.toLowerCase().replace(' ','-')} ${records[s.id]===status?'chosen':''}`} onClick={()=>mark(s.id,status)}>{status}</button>)}</div></div>)}{!visible.length&&<Empty title="No students in this filter" text="Try another filter."/>}</section><div className="save-row"><span>Attendance is submitted to the local Express JSON-file API.</span><button className="btn primary" onClick={save}><Check size={16}/> Save attendance</button></div></div>
}


function ReportsPage() {
  const [rows,setRows]=useState([])
  const [students,setStudents]=useState([])
  const [subjects,setSubjects]=useState([])
  const [subjectFilter,setSubjectFilter]=useState('All')
  const [monthFilter,setMonthFilter]=useState('All')
  const [err,setErr]=useState('')
  useEffect(()=>{Promise.all([api.exportRows(),api.students(),api.subjects()]).then(([r,s,sub])=>{setRows(r);setStudents(s);setSubjects(sub)}).catch(e=>setErr(e.message))},[])
  const months=[...new Set(rows.map(r=>r.date.slice(0,7)))].sort().reverse()
  const filteredRows=rows.filter(r=>(subjectFilter==='All'||r.subjectId===subjectFilter)&&(monthFilter==='All'||r.date.startsWith(monthFilter)))
  const studentRows=students.map(student=>{
    const own=filteredRows.filter(r=>r.rollNo===student.rollNo)
    const p=own.filter(r=>r.status==='Present').length
    const a=own.filter(r=>r.status==='Absent').length
    const od=own.filter(r=>r.status==='On Duty').length
    const total=p+a+od
    return {...student,p,a,od,total,rate:total?Math.round((p+od)/total*100):0}
  })
  const average=studentRows.length?Math.round(studentRows.reduce((n,student)=>n+student.rate,0)/studentRows.length):0
  const subjectSummary=subjects.map(subject=>{
    const own=filteredRows.filter(row=>row.subjectId===subject.id)
    return {...subject,total:own.length,p:own.filter(r=>r.status==='Present').length,a:own.filter(r=>r.status==='Absent').length,od:own.filter(r=>r.status==='On Duty').length}
  })
  function csv(){
    const data=[['Date','Student','Roll number','Subject','Status'],...filteredRows.map(r=>[r.date,r.student,r.rollNo,r.subject,r.status])]
    const content=data.map(row=>row.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',')).join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:'text/csv'}));a.download='pscmr-attendance-report.csv';a.click();URL.revokeObjectURL(a.href)
  }
  return <div className="stack">
    <div className="report-head"><div><span className="eyebrow">ATTENDANCE ANALYTICS</span><h2>Reports & insights</h2><p>Subject-wise, student-wise and monthly reporting.</p></div><button className="btn primary" onClick={csv}><Download size={16}/> Export CSV</button></div>
    {err&&<div className="notice error">{err}</div>}
    <section className="panel attendance-controls"><label>Subject<select value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}><option value="All">All subjects</option>{subjects.map(subject=><option key={subject.id} value={subject.id}>{subject.shortName} — {subject.name}</option>)}</select></label><label>Month<select value={monthFilter} onChange={e=>setMonthFilter(e.target.value)}><option value="All">All months</option>{months.map(month=><option key={month} value={month}>{month}</option>)}</select></label><div className="counts"><span>{filteredRows.length} records in current view</span></div></section>
    <div className="stats-grid three"><Stat label="Class average" value={`${average}%`} note="Across registered students" icon={ChartNoAxesColumn} tone="violet"/><Stat label="Attendance entries" value={filteredRows.length} note="Current filter selection" icon={ClipboardCheck} tone="blue"/><Stat label="Below 75%" value={studentRows.filter(student=>student.total>0&&student.rate<75).length} note="Students requiring attention" icon={Activity} tone="orange"/></div>
    <section className="panel"><div className="panel-head"><div><h3>Subject-wise summary</h3><p>Present + On Duty count as attended</p></div></div><div className="table-scroll"><table><thead><tr><th>SUBJECT</th><th>SESSIONS</th><th>PRESENT</th><th>ABSENT</th><th>ON DUTY</th><th>PRESENT RATE</th></tr></thead><tbody>{subjectSummary.map(subject=>{const rate=subject.total?Math.round((subject.p+subject.od)/subject.total*100):0;return <tr key={subject.id}><td><b>{subject.shortName} · {subject.name}</b></td><td>{subject.total}</td><td className="green-text">{subject.p}</td><td className="orange-text">{subject.a}</td><td>{subject.od}</td><td><span className={`rate ${rate>=75?'good':'low'}`}>{rate}%</span></td></tr>})}</tbody></table></div></section>
    <section className="panel"><div className="panel-head"><div><h3>Student attendance summary</h3><p>Filtered by the selected subject and month</p></div></div><div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>PRESENT</th><th>ABSENT</th><th>ON DUTY</th><th>ATTENDANCE</th></tr></thead><tbody>{studentRows.map(student=><tr key={student.id}><td className="person"><span className="avatar small">{student.name[0]}</span><b>{student.name}</b></td><td>{student.p}</td><td>{student.a}</td><td>{student.od}</td><td><span className={`rate ${student.rate>=75?'good':'low'}`}>{student.total?`${student.rate}%`:'—'}</span></td></tr>)}</tbody></table></div></section>
    <section className="panel"><div className="panel-head"><div><h3>Monthly attendance volume</h3><p>Records grouped by calendar month for the current subject filter</p></div></div><div className="chart-bars">{months.filter(month=>monthFilter==='All'||month===monthFilter).map(month=>{const count=filteredRows.filter(row=>row.date.startsWith(month)).length;const max=Math.max(1,...months.map(m=>rows.filter(row=>(subjectFilter==='All'||row.subjectId===subjectFilter)&&row.date.startsWith(m)).length));return <div className="chart-row" key={month}><b>{month}</b><div className="chart-track"><div className="chart-fill" style={{width:`${count/max*100}%`}}/></div><strong>{count}</strong></div>})}{!filteredRows.length&&<Empty title="No report data yet" text="Attendance records will appear here after faculty submits attendance."/ >}</div></section>
  </div>
}


function StudentReportsPage() {
  const [rows,setRows]=useState([])
  const [subjects,setSubjects]=useState([])
  const [selected,setSelected]=useState('All')
  const [error,setError]=useState('')
  useEffect(()=>{Promise.all([api.myAttendance(),api.subjects()]).then(([r,s])=>{setRows(r);setSubjects(s)}).catch(e=>setError(e.message))},[])
  const filtered=rows.filter(r=>selected==='All'||r.subjectId===selected)
  const monthly=Object.entries(filtered.reduce((acc,row)=>{const key=row.date.slice(0,7);acc[key]=(acc[key]||0)+1;return acc},{})).sort(([a],[b])=>b.localeCompare(a))
  return <div className="stack"><div className="welcome"><div><span className="eyebrow">STUDENT ANALYTICS</span><h2>My subject reports</h2><p>Review your attendance across each enrolled subject.</p></div></div>{error&&<div className="notice error">{error}</div>}<section className="panel attendance-controls"><label>Subject filter<select value={selected} onChange={e=>setSelected(e.target.value)}><option value="All">All subjects</option>{subjects.map(subject=><option key={subject.id} value={subject.id}>{subject.shortName} — {subject.name}</option>)}</select></label></section><div className="subject-grid">{subjects.filter(subject=>selected==='All'||subject.id===selected).map(subject=>{const own=rows.filter(row=>row.subjectId===subject.id);const p=own.filter(row=>row.status==='Present').length;const od=own.filter(row=>row.status==='On Duty').length;const a=own.filter(row=>row.status==='Absent').length;const rate=own.length?Math.round((p+od)/own.length*100):0;return <article className="subject-card" key={subject.id}><span className="subject-code">{subject.shortName}</span><h4>{subject.name}</h4><strong>{own.length?`${rate}%`:'—'}</strong><div className="chart-track"><div className="chart-fill" style={{width:`${rate}%`}}/></div><p>{p} Present · {a} Absent · {od} On Duty</p>{own.length&&rate<75?<span className="rate low">Below 75%</span>:null}</article>})}</div><section className="panel"><div className="panel-head"><div><h3>Monthly attendance history</h3><p>Recorded sessions for current filter</p></div></div><div className="chart-bars">{monthly.map(([month,count])=><div className="chart-row" key={month}><b>{month}</b><div className="chart-track"><div className="chart-fill" style={{width:`${count/Math.max(1,...monthly.map(x=>x[1]))*100}%`}}/></div><strong>{count}</strong></div>)}</div></section></div>
}

function ProfilePage() {
  const {user}=useAuth()
  return <div className="stack"><div className="welcome"><div><span className="eyebrow">ACCOUNT</span><h2>My profile</h2><p>Your signed-in student account details.</p></div></div><section className="panel profile-panel"><span className="avatar">{user.name[0]}</span><div><h3>{user.name}</h3><p className="muted">{user.email}</p><span className="soft-tag">Student</span></div></section><div className="notice warning">For this local demo, profile details are read-only. Ask the administrator to update account records.</div></div>
}

function SettingsPage() {
  return <div className="stack"><div className="welcome"><div><span className="eyebrow">SYSTEM CONFIGURATION</span><h2>Settings</h2><p>Configuration information for this local educational deployment.</p></div></div><section className="panel"><div className="panel-head"><div><h3>Attendance policy</h3><p>Current demonstration calculation</p></div></div><div className="profile-panel"><ShieldCheck/><div><b>75% minimum attendance threshold</b><p className="muted">Present and On Duty count as attended sessions.</p></div></div></section><section className="panel"><div className="panel-head"><div><h3>Data storage</h3><p>No database is configured or connected.</p></div></div><div className="profile-panel"><BookOpen/><div><b>Server-side JSON files</b><p className="muted">Stored in server/data. Back up these files regularly.</p></div></div></section></div>
}

function StudentHome() {
  const {user}=useAuth()
  const [rows,setRows]=useState([])
  const [subjects,setSubjects]=useState([])
  const [error,setError]=useState('')
  useEffect(()=>{Promise.all([api.myAttendance(),api.subjects()]).then(([r,sub])=>{setRows(r);setSubjects(sub)}).catch(e=>setError(e.message))},[])
  const p=rows.filter(r=>r.status==='Present').length
  const a=rows.filter(r=>r.status==='Absent').length
  const od=rows.filter(r=>r.status==='On Duty').length
  const rate=rows.length?Math.round((p+od)/rows.length*100):0
  return <div className="stack"><div className="welcome"><div><span className="eyebrow">STUDENT PORTAL</span><h2>Hello, {user.name.split(' ')[0]} <em>✦</em></h2><p>Your personal attendance overview.</p></div><span className="pill">Student account</span></div><div className="stats-grid three"><Stat label="Attendance" value={`${rate}%`} note="Present + On Duty" icon={ChartNoAxesColumn} tone="violet"/><Stat label="Present" value={p} note="Recorded present sessions" icon={Check} tone="green"/><Stat label="Absent" value={a} note="Recorded absent sessions" icon={Activity} tone="orange"/></div>{rate<75&&rows.length>0&&<div className="notice warning">Your attendance is below 75%. Please contact your faculty advisor.</div>}{error&&<div className="notice error">{error}</div>}<section className="panel"><div className="panel-head"><div><h3>Subject-wise attendance</h3><p>Each subject is calculated independently</p></div></div><div className="subject-grid">{subjects.map(subject=>{const own=rows.filter(r=>r.subjectId===subject.id);const attended=own.filter(r=>r.status==='Present'||r.status==='On Duty').length;const percent=own.length?Math.round(attended/own.length*100):0;return <div className="subject-card" key={subject.id}><span className="subject-code">{subject.shortName||subject.code}</span><h4>{subject.name}</h4><p>{attended} attended / {own.length} recorded</p><div className="chart-track"><div className="chart-fill" style={{width:`${percent}%`}}/></div><strong>{percent}%</strong>{own.length>0&&percent<75&&<span className="rate low">Below 75% threshold</span>}</div>})}</div></section><section className="panel"><div className="panel-head"><div><h3>My attendance history</h3><p>Your recorded subject sessions</p></div></div><div className="table-scroll"><table><thead><tr><th>DATE</th><th>SUBJECT ID</th><th>STATUS</th></tr></thead><tbody>{rows.map(r=><tr><td>{r.date}</td><td>{subjects.find(subject=>subject.id===r.subjectId)?.shortName || r.subjectId}</td><td><span className={`status ${r.status.toLowerCase().replace(' ','-')}`}>{r.status}</span></td></tr>)}</tbody></table>{!rows.length&&<Empty title="No attendance records yet" text="Your attendance will appear after faculty submits it."/>}</div></section></div>
}

function Modal({title,close,children}){return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-button" onClick={close}><X/></button></div>{children}</div></div>}
function Empty({title,text}){return <div className="empty"><BookOpen/><b>{title}</b><span>{text}</span></div>}

export default function App(){return <AuthProvider><Routes><Route path="/login" element={<Login/>}/><Route path="/*" element={<AuthenticatedShell/>}/></Routes></AuthProvider>}
function AuthenticatedShell(){const {user}=useAuth();return user?<Shell/>:<Navigate to="/login" replace/>}
