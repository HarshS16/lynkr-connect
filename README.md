# 🚀 Lynkr - Professional Networking Platform

<div align="center">
  
![Lynkr Logo](https://img.shields.io/badge/Lynkr-Professional%20Networking-blue?style=for-the-badge&logo=linkedin&logoColor=white)

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-4.0+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

**Connect. Share. Grow.**

*A modern LinkedIn-inspired professional networking platform built with cutting-edge web technologies*

[🌟 Live Demo](#) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/yourusername/lynkr/issues) • [💡 Request Feature](https://github.com/yourusername/lynkr/issues)

</div>


---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion
- **Backend:** Node.js, Express.js, PostgreSQL, Prisma ORM, JWT Auth
- **Database:** PostgreSQL (local or Supabase)
- **Deployment:** Vercel (frontend), Render (backend)
- **Other:** ESLint, Prettier, Jest, React Testing Library

---

## ⚡ Features

- User authentication (register, login, JWT, password reset)
- Complete user profiles with bio and avatar
- Create, view, and delete posts (with optional images)
- Public feed with real-time updates
- Send and accept connection requests
- See number of connections and view connection list
- Notifications for connection requests and acceptances
- Responsive, accessible, and mobile-friendly UI

---

## 🚀 Setup Instructions

### 1. **Clone the repository**
```bash
git clone https://github.com/yourusername/lynkr.git
cd lynkr
```

### 2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 3. **Configure Environment Variables**

Create a `.env` file in both the root and `/server` directories. Example for backend:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/lynkr_db"
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL="http://localhost:3000"
PORT=5000
```

### 4. **Setup Database**

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run seed # optional, if you have a seed script
cd ..
```

### 5. **Run the App**

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## 🌟 Extra Features

- **Notifications:** Get notified when your connection request is accepted.
- **Profile Avatars:** Upload and remove your profile picture.
- **Connection List:** See and click through your connections from your profile.
- **Image Uploads:** Add images to your posts.
- **Accessibility:** WCAG-compliant design.
- **Mobile Responsive:** Works great on all devices.

---

## 📝 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Inspired by [LinkedIn](https://linkedin.com)
- Built with [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Supabase](https://supabase.com/), and [Prisma](https://prisma.io/)

---

**Made with ❤️ by Harsh Srivastava**
