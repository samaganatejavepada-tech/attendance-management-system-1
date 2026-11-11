# PSCMR College Attendance Management System

A React + Express attendance management project for a Web Technologies laboratory.

## Strict storage rule

**No database is used or connected.** No MongoDB, MySQL, Firebase, SQLite or cloud database is included.

The Express backend stores records in local JSON files under `server/data/`. Browser LocalStorage is not used for attendance records. Login sessions use Express Session's default in-memory store, which is suitable only for a local educational demonstration.

## Requirements

- Node.js 18 or newer
- npm
- Visual Studio Code

## Install and run

1. Extract `PSCMR-Attendance-System.zip`.
2. In VS Code choose **File → Open Folder** and open `PSCMR-Attendance-System`.
3. Open **Terminal → New Terminal**.
4. Run:

   ```bash
   npm install
   ```

5. Start both servers:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:5173` in your browser.

Backend health check: `http://localhost:5000/api/health`

### If PowerShell blocks npm.ps1

Use:

```powershell
npm.cmd install
npm.cmd run dev
```

Or change the VS Code terminal profile to Command Prompt and use `npm install` and `npm run dev`.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@pscmr.edu.in | Admin@123 |
| Faculty | faculty@pscmr.edu.in | Faculty@123 |
| Student | student@pscmr.edu.in | Student@123 |

## Implemented

- Role-based demo login (Admin, Faculty, Student)
- Express session authentication and role middleware
- Admin student CRUD using JSON files
- Admin subject catalogue seeded with FSD, DWDM, Flutter and Design
- Subject management page and subject CRUD API
- Admin faculty creation and deletion with hashed demo passwords
- Faculty/admin attendance marking by date and subject
- Present, Absent and On Duty statuses
- Duplicate attendance update by student + subject + date
- Student personal attendance history
- Student subject-wise attendance percentages and filtered reports
- Subject and month filters in reports
- Attendance summary and CSV export
- React Router protected pages
- Responsive dashboard design

## JSON data files

Created automatically on first server start:

- `server/data/users.json`
- `server/data/students.json`
- `server/data/faculty.json`
- `server/data/subjects.json` (automatically migrated to include FSD, DWDM, Flutter and Design)
- `server/data/attendance.json`

Do not manually edit these while the server is running unless you understand the data format. Back up this folder before resetting data.

## Important limitations

- JSON files are appropriate for a single-server classroom demo, not concurrent college-wide production use. Multiple server instances, simultaneous writes, file corruption and backups require stronger engineering.
- Express Session's default MemoryStore is not production-grade and sessions reset when the server restarts.
- Use HTTPS, a strong SESSION_SECRET, secure cookies, a persistent session store, audit logs, backups, access controls and security review before handling actual student records.
- The demo accounts and sample student data are fictional. Replace them only with authorized data.
- This project does not claim official affiliation or approval by PSCMR College.
