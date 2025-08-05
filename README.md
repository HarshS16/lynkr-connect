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

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [📱 Screenshots](#-screenshots)
- [🌐 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## ✨ Features

### 🔐 **Authentication & Security**
- [x] **Secure Registration** - Email & password with validation
- [x] **JWT Authentication** - Secure token-based auth system
- [x] **Profile Management** - Complete user profile with bio
- [x] **Password Security** - Bcrypt hashing with salt rounds
- [x] **Form Validation** - Client & server-side validation

### 📝 **Social Features**
- [x] **Post Creation** - Share thoughts and insights (text-only)
- [x] **Public Feed** - View all posts with real-time updates
- [x] **User Profiles** - View other users' profiles and posts
- [x] **Responsive Design** - Mobile-first approach
- [x] **Interactive UI** - Smooth animations and transitions

### 🎨 **Modern UI/UX**
- [x] **Sleek Design** - Professional LinkedIn-inspired interface
- [x] **Dark/Light Mode** - Coming soon
- [x] **Smooth Animations** - Framer Motion powered interactions
- [x] **Mobile Responsive** - Works perfectly on all devices
- [x] **Accessibility** - WCAG compliant design

### 🔮 **Coming Soon**
- [ ] **Real-time Messaging** - Direct messages between users
- [ ] **Post Interactions** - Like, comment, and share posts
- [ ] **User Connections** - Follow/connect with other professionals
- [ ] **Advanced Search** - Find users and posts with filters
- [ ] **Notifications** - Real-time notification system
- [ ] **Rich Text Editor** - Enhanced post creation experience

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| ![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react) | `^18.2.0` | UI Framework |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-3178C6?style=flat-square&logo=typescript) | `^5.0.2` | Type Safety |
| ![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF?style=flat-square&logo=vite) | `^4.4.5` | Build Tool |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-38B2AC?style=flat-square&logo=tailwind-css) | `^3.3.0` | Styling |
| ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-10.16.4-0055FF?style=flat-square) | `^10.16.4` | Animations |
| ![React Router](https://img.shields.io/badge/React%20Router-6.15.0-CA4245?style=flat-square&logo=react-router) | `^6.15.0` | Routing |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-18.17.0-339933?style=flat-square&logo=node.js) | `^18.17.0` | Runtime |
| ![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000000?style=flat-square&logo=express) | `^4.18.2` | Web Framework |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.4-336791?style=flat-square&logo=postgresql) | `^15.4` | Database |
| ![Prisma](https://img.shields.io/badge/Prisma-5.2.0-2D3748?style=flat-square&logo=prisma) | `^5.2.0` | ORM |
| ![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?style=flat-square&logo=json-web-tokens) | `^9.0.2` | Authentication |

### **Development & Deployment**
| Technology | Purpose |
|------------|---------|
| ![ESLint](https://img.shields.io/badge/ESLint-8.45.0-4B32C3?style=flat-square&logo=eslint) | Code Linting |
| ![Prettier](https://img.shields.io/badge/Prettier-3.0.0-F7B93E?style=flat-square&logo=prettier) | Code Formatting |
| ![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=flat-square&logo=vercel) | Frontend Hosting |
| ![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=flat-square) | Backend Hosting |

---

## 🚀 Quick Start

### **Prerequisites**

Before you begin, ensure you have the following installed:

- ![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933?style=flat-square&logo=node.js) **Node.js** (18.0 or higher)
- ![npm](https://img.shields.io/badge/npm-9.0+-CB3837?style=flat-square&logo=npm) **npm** (9.0 or higher) or ![Yarn](https://img.shields.io/badge/Yarn-1.22+-2C8EBB?style=flat-square&logo=yarn) **Yarn**
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0+-336791?style=flat-square&logo=postgresql) **PostgreSQL** (15.0 or higher)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lynkr.git
   cd lynkr
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/lynkr_db"
   
   # JWT Secret
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   
   # App Configuration
   NODE_ENV="development"
   PORT=5000
   FRONTEND_URL="http://localhost:3000"
   
   # Email Configuration (Optional)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Database Setup**
   ```bash
   # Navigate to server directory
   cd server
   
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Seed the database (optional)
   npm run seed
   ```

5. **Start the development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
lynkr/
├── 📁 public/                 # Static assets
│   ├── favicon.ico
│   └── index.html
├── 📁 src/                    # Frontend source code
│   ├── 📁 components/         # Reusable UI components
│   │   ├── 📁 ui/            # Base UI components
│   │   ├── 📁 layout/        # Layout components
│   │   └── 📁 features/      # Feature-specific components
│   ├── 📁 hooks/             # Custom React hooks
│   ├── 📁 pages/             # Page components
│   ├── 📁 services/          # API services
│   ├── 📁 utils/             # Utility functions
│   ├── 📁 types/             # TypeScript type definitions
│   └── 📁 styles/            # Global styles
├── 📁 server/                 # Backend source code
│   ├── 📁 src/
│   │   ├── 📁 controllers/   # Route controllers
│   │   ├── 📁 middleware/    # Express middleware
│   │   ├── 📁 models/        # Database models
│   │   ├── 📁 routes/        # API routes
│   │   ├── 📁 services/      # Business logic
│   │   └── 📁 utils/         # Server utilities
│   ├── 📁 prisma/            # Database schema & migrations
│   └── 📁 tests/             # Backend tests
├── 📁 docs/                  # Documentation
├── 📄 package.json           # Dependencies & scripts
├── 📄 README.md              # You are here!
└── 📄 .env.example           # Environment variables template
```

---

## 🔧 Configuration

### **Environment Variables**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `JWT_SECRET` | Secret for JWT token signing | - | ✅ |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` | ❌ |
| `NODE_ENV` | Environment mode | `development` | ❌ |
| `PORT` | Server port | `5000` | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | ❌ |

### **Scripts**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |

---

## 📱 Screenshots

<div align="center">

### 🏠 **Landing Page**
![Landing Page](https://via.placeholder.com/800x500/4F46E5/FFFFFF?text=Landing+Page)

### 📝 **Dashboard**
![Dashboard](https://via.placeholder.com/800x500/059669/FFFFFF?text=Dashboard)

### 👤 **Profile Page**
![Profile](https://via.placeholder.com/800x500/DC2626/FFFFFF?text=Profile+Page)

### 📱 **Mobile Responsive**
<img src="https://via.placeholder.com/300x600/7C3AED/FFFFFF?text=Mobile+View" alt="Mobile View" width="300"/>

</div>

---

## 🌐 API Documentation

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `POST` | `/api/auth/logout` | User logout | ✅ |
| `GET` | `/api/auth/me` | Get current user | ✅ |

### **User Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users/:id` | Get user profile | ✅ |
| `PUT` | `/api/users/:id` | Update user profile | ✅ |
| `GET` | `/api/users/:id/posts` | Get user's posts | ✅ |

### **Post Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/posts` | Get all posts | ✅ |
| `POST` | `/api/posts` | Create new post | ✅ |
| `GET` | `/api/posts/:id` | Get specific post | ✅ |
| `DELETE` | `/api/posts/:id` | Delete post | ✅ |

### **Example Requests**

<details>
<summary><strong>📝 Register User</strong></summary>

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "bio": "Software Developer passionate about web technologies"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "clnx1234567890",
    "fullName": "John Doe",
    "email": "john@example.com",
    "bio": "Software Developer passionate about web technologies",
    "createdAt": "2023-10-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
</details>

<details>
<summary><strong>📄 Create Post</strong></summary>

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Just shipped a new feature! Excited to share my learning journey with the community. 🚀"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "clnx0987654321",
    "content": "Just shipped a new feature! Excited to share my learning journey with the community. 🚀",
    "authorId": "clnx1234567890",
    "createdAt": "2023-10-15T14:30:00.000Z",
    "author": {
      "fullName": "John Doe",
      "email": "john@example.com"
    }
  }
}
```
</details>

---

## 🧪 Testing

### **Run Tests**

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run backend tests
cd server && npm run test
```

### **Test Structure**

```
tests/
├── 📁 unit/              # Unit tests
├── 📁 integration/       # Integration tests
├── 📁 e2e/              # End-to-end tests
└── 📁 __mocks__/        # Test mocks
```

### **Testing Tools**
- **Jest** - Testing framework
- **React Testing Library** - React component testing
- **Supertest** - API testing
- **Cypress** - E2E testing (coming soon)

---

## 🚀 Deployment

### **Frontend Deployment (Vercel)**

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

```bash
# Manual deployment
npm run build
npx vercel --prod
```

### **Backend Deployment (Render)**

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Set environment variables**
4. **Configure build and start commands:**
   - **Build Command:** `cd server && npm install && npx prisma generate`
   - **Start Command:** `cd server && npm start`

### **Database Deployment**

#### **Option 1: Supabase (Recommended)**
```bash
# Create project on Supabase
# Copy connection string to DATABASE_URL
# Run migrations
npx prisma migrate deploy
```

#### **Option 2: Railway**
```bash
# Create PostgreSQL database on Railway
# Copy connection string to DATABASE_URL
# Deploy with automatic migrations
```

### **Environment Variables for Production**

```env
# Production Database
DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Strong JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-strong-jwt-secret-for-production"

# Production URLs
NODE_ENV="production"
FRONTEND_URL="https://your-app.vercel.app"
```

---

## 🤝 Contributing

We love contributions! Here's how you can help make Lynkr even better:

### **Quick Contributing Guide**

1. **🍴 Fork the repository**
2. **🌟 Create your feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **✨ Make your changes**
4. **🧪 Run tests**
   ```bash
   npm run test
   npm run lint
   ```
5. **💾 Commit your changes**
   ```bash
   git commit -m "✨ Add amazing feature"
   ```
6. **🚀 Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **📝 Open a Pull Request**

### **Commit Convention**

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` ✨ New features
- `fix:` 🐛 Bug fixes
- `docs:` 📚 Documentation updates
- `style:` 💄 Code style changes
- `refactor:` ♻️ Code refactoring
- `test:` 🧪 Adding tests
- `chore:` 🔧 Maintenance tasks

### **Development Guidelines**

<details>
<summary><strong>📋 Code Style Guidelines</strong></summary>

- Use **TypeScript** for type safety
- Follow **ESLint** and **Prettier** configurations
- Write **meaningful commit messages**
- Add **tests** for new features
- Update **documentation** as needed
- Use **semantic naming** for variables and functions

</details>

<details>
<summary><strong>🔍 Code Review Process</strong></summary>

1. Ensure all tests pass
2. Check code coverage remains above 80%
3. Verify TypeScript types are correct
4. Review for security vulnerabilities
5. Test on different devices/browsers
6. Get approval from at least one maintainer

</details>

### **🐛 Bug Reports**

Found a bug? Help us fix it!

1. **Search existing issues** to avoid duplicates
2. **Use the bug report template**
3. **Provide clear reproduction steps**
4. **Include screenshots/videos** if relevant
5. **Specify your environment** (OS, browser, etc.)

### **💡 Feature Requests**

Have an idea for a new feature?

1. **Check the roadmap** to see if it's already planned
2. **Use the feature request template**
3. **Explain the use case** and expected behavior
4. **Consider implementation complexity**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2023 Lynkr Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

Special thanks to all the amazing people and projects that made Lynkr possible:

### **🌟 Inspiration**
- **LinkedIn** - For inspiring the concept of professional networking
- **Twitter** - For the clean, simple post interface design
- **Discord** - For real-time communication patterns

### **🛠️ Technologies**
- **[React Team](https://reactjs.org/)** - For the amazing React framework
- **[Vercel](https://vercel.com/)** - For seamless deployment experience
- **[Tailwind CSS](https://tailwindcss.com/)** - For the utility-first CSS framework
- **[Prisma](https://prisma.io/)** - For the excellent database toolkit

### **👥 Community**
- **[Stack Overflow](https://stackoverflow.com/)** - For countless solutions
- **[GitHub Community](https://github.com/)** - For the collaborative platform
- **[MDN Web Docs](https://developer.mozilla.org/)** - For comprehensive documentation

### **🎨 Design Resources**
- **[Heroicons](https://heroicons.com/)** - For beautiful SVG icons
- **[Unsplash](https://unsplash.com/)** - For stunning photography
- **[Figma Community](https://figma.com/community)** - For design inspiration

---

<div align="center">

### **🚀 Ready to Connect?**

[**⭐ Star this repo**](https://github.com/yourusername/lynkr) • [**🐛 Report Issues**](https://github.com/yourusername/lynkr/issues) • [**💬 Join Discussions**](https://github.com/yourusername/lynkr/discussions)

**Made with ❤️ by the Lynkr Team**

---

![GitHub stars](https://img.shields.io/github/stars/yourusername/lynkr?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/lynkr?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/lynkr)
![GitHub license](https://img.shields.io/github/license/yourusername/lynkr)

</div>
