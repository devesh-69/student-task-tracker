<div align="center">

# 🎓 Student Task Tracker

**A Modern, Intelligent Task Management System for Students**

[![Made with React](https://img.shields.io/badge/Made%20with-React%2019-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Powered by Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285f4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Production-success?style=for-the-badge)](https://studenttasky.netlify.app/)

_Manage your academic journey with smart AI assistance, beautiful UI, and zero dependencies on external servers_

**✨ [Try it Live → https://studenttasky.netlify.app/](https://studenttasky.netlify.app/) ✨**

[Features](#-features) • [Getting Started](#-getting-started) • [Usage Guide](#-usage-guide) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture)

</div>

---

## 📋 Overview

**Student Task Tracker** is a powerful, offline-first task management application specifically designed for students. Built with modern web technologies, it provides an intuitive interface for tracking assignments, projects, and academic goals with intelligent AI-powered suggestions.

### Why Choose This Tracker?

✅ **100% Free & Open Source** - No subscriptions, no hidden costs  
✅ **Privacy-First** - All data stored locally on your device  
✅ **AI-Powered** - Smart task breakdown using Google Gemini  
✅ **Beautiful UI** - Modern, responsive design with smooth animations  
✅ **Zero Setup** - No backend servers or databases required  
✅ **Offline-Ready** - Works completely offline after initial load

---

## ✨ Features

### Core Functionality

- **📝 Smart Task Management**: Create, edit, and delete tasks with title, description, deadline, and progress tracking
- **✅ Auto-Checklist Detection**: Type numbered lists (1., 2., 3.) - they automatically become interactive checkboxes
- **🎯 Auto-Progress Tracking**: Progress calculated automatically from checked items (e.g., 2/4 checked = 50%)
- **📊 Thread-Based Activity Logs**: Comprehensive history of all updates with timestamps (persistent even after task deletion)
- **🔔 Deadline Alerts**: Automatic overdue detection and visual indicators
- **👤 User Profiles**: Personalized welcome with optional API key input during onboarding

> **📌 Important Note**: When you check/uncheck a box, the system logs it as a thread entry (e.g., "Checked 'First step' - Progress: 25%"). **The original checklist item text is never changed** - only the completion status and progress are updated.

### Backend & Security

- **☁️ MongoDB Cloud Database**: All data persisted to MongoDB Atlas (single source of truth)
- **🔐 Encrypted API Keys**: AES-256 encryption using crypto-js for secure storage
- **🗄️ RESTful API**: Complete Express.js backend with Mongoose ODM
- **📜 Persistent Logs**: Activity logs survive task deletion (separate collection)
- **⏱️ Safe Data Management**: 10-second countdown with cancel button for clearing data

### Advanced Features

- **🤖 AI Assistant**: Get intelligent task breakdowns powered by Google Gemini 2.5 Flash Lite
- **🎉 Celebration Effects**: Confetti animation when you reach 100% completion
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **🎨 Professional Icons**: Lucide React icons throughout (no emojis!)
- **🎨 Modern UI**: Beautiful gradients, glassmorphism effects, and smooth transitions
- **♿ Accessible**: Semantic HTML and keyboard-friendly navigation

### Interaction Patterns

- **Single Tap/Click**: Open task detail view with progress slider
- **Long Press (500ms)**: Open context menu for edit/delete options
- **AI Assist Button**: Generate smart subtask suggestions based on task title
- **Clear Data**: Reset all data with double-confirmation safety

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **(Optional)** Google Gemini API key for AI features - [Get free key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd student-task-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API Key** (Optional - for AI features)

   Edit `.env.local` and add your Gemini API key:

   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

   > **Note**: The app works perfectly fine without an API key. AI Assist will simply show a message to configure the key when clicked.

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000` and start tracking your tasks! 🎉

### Building for Production

```bash
npm run build
```

Optimized production files will be in the `dist/` folder, ready to deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

---

## 📖 Usage Guide

### First Time Setup

1. **Onboarding**: Enter your name when prompted on first launch
2. **Create Your First Task**: Click the floating "+" button
3. **Fill Task Details**:
   - **Title**: Assignment or project name
   - **Description**: Details, notes, or subtasks
   - **Deadline**: Due date for the task
   - **Status**: Initial status (Pending/In Progress/Completed)
   - **Progress**: How much is complete (0-100%)

### Managing Tasks

#### Creating Tasks

- Click the **floating action button** (bottom-right corner)
- Fill in task details
- Use **AI Assist** button for smart subtask suggestions
- Click **Create Task** to save

#### Updating Progress

- **Tap/Click** any task card to open detail view
- Adjust progress using the **slider** (in 5% increments)
- Add an optional **note** to document what you did
- Click **Update Progress & Add Log** to save

#### Editing Tasks

- **Long-press** (hold for 500ms) any task card
- Select **Edit Task** from the menu
- Modify any fields and save

#### Deleting Tasks

- **Long-press** the task card
- Select **Delete Task** from the menu
- Confirm deletion

### Dashboard Overview

Your dashboard shows:

- **Overall Progress**: Average completion across all tasks
- **Pending Tasks**: Number of incomplete tasks
- **Completed Tasks**: Number of finished tasks
- **Task Cards**: All your tasks sorted by creation date

### AI Features

Click **✨ AI Assist** in the task form description field to:

- Get suggested study plans
- Break down complex tasks into steps
- Receive actionable subtasks

_Requires a valid Gemini API key in `.env.local`_

### Data Management

#### Changing Your Name

Click your name in the top-right corner to update your profile.

#### Clearing All Data

Click **Clear Data** button (trash icon) in the header:

- Double-confirmation required for safety
- Removes all tasks and user profile
- Triggers onboarding flow again

---

## 🛠️ Tech Stack

### Frontend

- **React 19** - Latest React with improved hooks and performance
- **TypeScript 5.8** - Type-safe development
- **Vite 6.2** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS via CDN

### AI/ML

- **Google Gemini 2.5 Flash** - Advanced AI for task suggestions
- **@google/genai** - Official Gemini SDK

### Storage

- **LocalStorage API** - Client-side data persistence
- **Browser Cache** - Offline-first architecture

### UI/UX Libraries

- **Canvas Confetti** - Celebration animations
- **Google Fonts (Inter)** - Modern typography
- **Custom Components** - Handcrafted UI components

---

## 🏗️ Architecture

### Project Structure

```
student-task-tracker/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Modal, Input, etc.)
│   ├── TaskList.tsx    # Task grid display
│   ├── TaskItem.tsx    # Individual task card with gestures
│   ├── TaskForm.tsx    # Create/Edit form with AI assist
│   ├── TaskDetailModal.tsx  # Progress slider & logs
│   ├── TaskActionMenu.tsx   # Context menu (edit/delete)
│   └── UserOnboardingModal.tsx  # First-time user setup
├── pages/              # Page components
│   └── Home.tsx        # Main dashboard controller
├── services/           # Business logic layer
│   ├── taskService.ts  # CRUD operations for tasks
│   ├── userService.ts  # User profile management
│   ├── geminiService.ts  # AI integration
│   └── audioService.ts   # Sound effects
├── types.ts            # TypeScript interfaces
├── .env.local          # Environment variables
└── index.html          # Entry point with Tailwind config
```

### Data Flow

```
User Action → Component → Service Layer → LocalStorage
                ↓                ↓
            State Update    Data Validation
                ↓
            UI Re-render
```

### Key Design Patterns

- **Single Source of Truth**: All state managed in `Home.tsx`
- **Service Layer**: Separation of UI and data logic
- **Error Boundaries**: Comprehensive try-catch blocks
- **Optimistic Updates**: Immediate UI feedback with rollback on error
- **Defensive Programming**: Input validation at multiple levels

---

## 🔒 Privacy & Security

- **No External Servers**: All data stays on your device
- **No Tracking**: Zero analytics or user tracking
- **No Authentication**: No account creation needed
- **Local-Only Storage**: Data lives in browser localStorage
- **API Key Safety**: Gemini API key stored in environment variables (never in code)

> ⚠️ **Important**: Clearing browser data will delete all tasks. Export your data manually if needed (feature can be added).

---

## 🐛 Troubleshooting

### AI Assist Not Working

- ✅ Check that `VITE_GEMINI_API_KEY` is set in `.env.local`
- ✅ Verify API key is valid on [Google AI Studio](https://aistudio.google.com/)
- ✅ Restart dev server after changing `.env.local`
- ✅ Check browser console for specific error messages

### Tasks Not Saving

- ✅ Check if localStorage is enabled in browser settings
- ✅ Verify you're not in incognito/private mode
- ✅ Check if storage quota is exceeded (shows alert)
- ✅ Try clearing old tasks to free up space

### App Not Loading

- ✅ Ensure Node.js is installed: `node --version`
- ✅ Delete `node_modules` and run `npm install` again
- ✅ Check if port 3000 is available
- ✅ Try a different browser

### Data Reset Issues

- Clear browser cache and cookies for localhost
- Check browser console for localStorage errors
- Verify browser supports localStorage API

---

## 🎯 Roadmap & Future Enhancements

While this project is feature-complete, potential improvements include:

- [ ] Data export/import (JSON, CSV)
- [ ] Dark mode toggle
- [ ] Calendar view for deadlines
- [ ] Task categories/tags
- [ ] Search and filter functionality
- [ ] Task templates
- [ ] Backend API with MongoDB (optional)
- [ ] Multi-device sync

---

## 🤝 Contributing

This is an educational project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Built with ❤️ for students, by students.

**Project Maintainer**: [Your Name]  
**Google AI Studio**: [View App](https://ai.studio/apps/drive/17LWGBuR2TBVT1DQjxfcKQsn2fQl4FWtH)

---

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Google Gemini** - For powerful AI capabilities
- **Tailwind Labs** - For beautiful styling utilities
- **Vite Team** - For the blazing-fast dev experience

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

**Made for MCA Students | Built with Modern Web Technologies**

</div>
