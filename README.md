# TripZo — Travel & Hostel Booking Platform for Northern Pakistan

**Plan the trail. Book the stay.**

TripZo is a complete travel platform for Pakistan's northern areas — **Hunza, Skardu and Swat** — where travellers can discover and book verified hostels and guesthouses, plan trips with their group, and get help from an AI travel assistant. Stay owners manage their own listings and bookings, and admins run the whole platform from a full dashboard.

This is my **Final Year Project** for BS Information Technology at Baba Guru Nanak University (BGNU).

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)

## Watch the demo

Full demo video on LinkedIn:
https://www.linkedin.com/feed/update/urn:li:activity:7520194326790942720/


## Features

**For travellers**
- Explore verified stays and hostels in Hunza, Skardu and Swat
- See rooms before booking with a 360° photo viewer
- Book stays and manage bookings from your own account
- Trip Planner — plan a trip together with a group chat
- TripZo AI assistant for travel questions
- Reviews that come only from completed stays

**For stay owners**
- Owner dashboard to add and manage listings, rooms and photos
- Manage incoming bookings
- Document verification (owners are verified before their stays go live)

**For admins**
- Full admin dashboard — users, stays, bookings and platform data
- Secure login with role-based access for travellers, owners and admins (JWT authentication)

## Tech stack

| Part | Technology |
| --- | --- |
| Backend API | Node.js, Express, MySQL, JWT, bcryptjs, Multer, Nodemailer |
| Web frontend | React 18, Vite, Tailwind CSS, React Router, React Query, Zustand, Socket.io |
| Tools & APIs | Git, GitHub, Google Maps API, Gemini API |

## Project structure

```
TripZo/
├── tripzo-backend/    Node.js + Express API (controllers, models, routes, services)
└── tripzo-frontend/   React + Vite web app
```

## Run it locally

You need Node.js and MySQL installed. Each part uses its own local `.env` file — create it in that folder with your own values. **Never commit a `.env` file to GitHub** (the `.gitignore` in this repo already blocks it).

**Backend** — create `tripzo-backend/.env` with your database and key settings (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, email and API keys), then:

```bash
cd tripzo-backend
npm install
npm start
```

**Web frontend** — create `tripzo-frontend/.env` with `VITE_API_BASE_URL` pointing to the backend, then:

```bash
cd tripzo-frontend
npm install
npm run dev
```

## About the developer

**Muhammad Atif** — Full-Stack Developer
BS Information Technology, Baba Guru Nanak University (2022–2026) — Nankana Sahib, Punjab, Pakistan

- LinkedIn: https://www.linkedin.com/in/matif-asif-63788835b/
- GitHub: https://github.com/matif292
- Email: matifasif869@gmail.com

Open to internships, freelance projects and junior full-stack roles.