# 🏗️ Don-8 Developer Guide – Branch Notes

Welcome to the **Don-8 Dev Guide** for this branch.  
This document contains setup instructions, pending tasks, the NGO Application process flow, API endpoints, environment variables, sample payloads, and contribution guidelines.  

---

## 📌 Project Overview  

The Don-8 platform connects NGOs and donors through a transparent and efficient donation management system.  
This branch focuses on:  
- NGO **application handling**  
- NGO **authentication**  
- Admin **review process**  
- Status **tracking of NGO applications**  

---

✅ Pending Tasks

- Wire NGO Application to Backend
POST /register
- Implement NGO Authentication
POST /ngol/login
- Fetch NGO Applications for Review in Admin Dashboard
GET /admin/dashboard
- Integrate Status Tracking
GET /ngo-application/:id/status


📂 NGO Application Process

The NGO application module is structured as follows:

ngo-application/
 ├── [id]/
 │    └── status.ts         # Handles NGO application status (fetch/update per NGO ID)
 ├── ngo-application.ts     # Main entry for NGO application submission
 └── route.ts               # API routes for NGO application (REST endpoints)


File Responsibilities

ngo-application.ts → Creates/submits an NGO application.

route.ts → Defines backend routes related to NGO applications.

[id]/status.ts → Fetches and updates application status for a specific NGO.