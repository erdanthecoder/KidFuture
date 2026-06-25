# KidLearn 🎓

A modern Google Classroom-style learning platform for kids with quizzes, games, real-time world islands, homework, and full Russian/English support.

## Features

- **👨‍🎓 Student Dashboard** - Quizzes, Games, Lessons, Homework, World Islands, Avatar Editor, Summary Sheet
- **👩‍🏫 Teacher Dashboard** - Create quizzes/lessons/homework, manage students, announcements, Admin Abuse Panel (disco, crab rave, fireworks)
- **🌍 Full i18n** - English & Russian language support
- **🏝️ World Islands** - Real-time multiplayer via Socket.io (Among Us, Minecraft, Dojo Arena)
- **⭐ Currency** - Stars earned from activities, convert 30 Stars = 1 House Point
- **📋 Homework** - Google Forms-style creator with text, choice, checkbox questions
- **📝 Quizzes** - Maths, English, Russian for Year 1 & 2
- **🎮 Games** - Interactive learning games
- **📖 Lessons** - Content with video support

## Deploy to Railway

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: KidLearn platform"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/kidlearn.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Railway
1. Go to [railway.app](https://railway.app) and login with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `kidlearn` repo
4. Railway auto-detects the config - it will install, build, and seed the database
5. Your app is live!

### 3. Socket.io Server (for World Islands)
Railway will run the main app. The Socket.io server for islands runs on port 3001 inside the same container.

## Tech Stack
- Next.js 14 (App Router)
- Prisma + SQLite
- Socket.io
- Tailwind CSS
- Framer Motion
- JWT Auth

## Local Development
```bash
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```
