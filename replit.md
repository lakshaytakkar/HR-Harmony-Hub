# TeamSync - HR Management Portal

## Overview
TeamSync is a custom HR Management Portal designed with a focus on exceptional UI/UX, drawing inspiration from the Dropship.io design system. It provides comprehensive CRUD operations across various HR modules and is built to be recruiter-ready. The project aims to offer a standardized, visually appealing, and highly functional platform for managing HR processes.

## User Preferences
Not specified.

## System Architecture

### Frontend Technology
The frontend is built using React with TypeScript, styled with Tailwind CSS, and utilizes Shadcn UI for componentry. Routing is handled by Wouter, and animations are powered by `motion/react` (Framer Motion). The single font family is Plus Jakarta Sans, used for both headings and body text.

### Design System
The UI/UX is inspired by the Dropship.io design system, featuring custom brand tokens mapped to CSS variables for consistent theming. This includes a primary blue palette, a comprehensive greyscale, and semantic status colors for indicators. Shadows are meticulously defined, and typography scales are established using Plus Jakarta Sans as the unified font family.

### Core UI/UX Decisions and Components
- **Two-Level Horizontal Top Navigation**: Replaces traditional sidebars, offering category-based (Level 1: Dashboard, People, Recruitment, Operations, Finance, Projects, Design System) and sub-page navigation (Level 2) with animated indicators.
- **Page Layout**: Content areas maintain consistent padding (`px-8 py-6 lg:px-12`).
- **Data Table**: A generic, reusable component supporting search, filtering, sorting, pagination, row selections, and actions, with integrated empty state illustrations.
- **Status Badge**: Automatically maps status strings to a predefined set of semantic color variants (success, error, warning, info, neutral).
- **Form Dialog**: A standardized dialog for all create/edit forms.
- **Empty State**: Reusable component with illustrations, messaging, and an optional action button.
- **Page Banner**: A full-width, branded banner with a 3D icon (WebP, 128×128, ~3KB each), title, description, and optional action button, used consistently across HR pages. Icon display size is `size-16` (64px).
- **Document Preview Modal**: A modal for viewing mock document content (PDF, DOCX, XLSX, certificates) with navigation.
- **Loading States**: Includes various spinners and skeleton components (TableSkeleton, CardSkeleton, StatsCardSkeleton) to provide clear feedback during data loading.
- **Toast System**: A custom, module-level toast notification system with 4 semantic types (success, error, info, warning) displayed at the bottom-right.
- **Animation System**: Leverages `motion/react` for smooth page transitions, element reveals (fade, scale, slide), staggered animations for lists, and micro-interactions.

### HR Modules and Features
- **Dashboard**: Provides an overview with key statistics, recent activities, and summaries.
- **Employee Management**: Comprehensive CRUD operations for employee records.
- **Candidate Management**: Tools for managing the recruitment pipeline.
- **Department Management**: Structure and organization of departments.
- **Job Postings**: Management of open positions.
- **Leave Management**: Workflow for leave requests and approvals.
- **Attendance Tracking**: Daily check-in/out records.
- **Document Management**: Organization and access to HR-related documents.
- **Payroll**: Manages payroll runs, entries, and provides related statistics.
- **Project Management**: Includes a project list with card view, detailed project view with Kanban and table layouts for tasks.

### Backend Technology
The backend is powered by Express.js (Node.js).

### Data Model
Data models for all HR entities (Employee, Candidate, Department, JobPosting, LeaveRequest, AttendanceRecord, HRDocument, PayrollRun, PayrollEntry, Project, ProjectTask) are defined using Zod for validation. Currently, the system uses in-memory mock data, with future plans for database integration.

## Component Registry References (shadcn-compatible)
- **KokonutUI** (https://kokonutui.com): Cards (Spotlight, Bento Grid, Liquid Glass), Buttons (Particle, Gradient, Magnet), Inputs (Action Search Bar, Profile Dropdown), Text Effects (Shimmer, Typing, Dynamic), Navigation (Smooth Tab, Morphic Navbar), AI Components. Install: `npx shadcn@latest add @kokonutui/<name>`
- **Cult-UI** (https://www.cult-ui.com): Cards (Expandable, Minimal, Texture, Shift), Navigation (Direction Aware Tabs, Floating Panel), Interactive (Dynamic Island, Timer), Typography (Animated Number, Gradient Heading, Typewriter), Media (Logo Carousel, 3D Carousel). Install: `npx shadcn@beta add @cult-ui/<name>`
- **Aceternity UI** (https://ui.aceternity.com): 3D Card Effect, Animated Tooltip, Bento Grid, Card Hover Effect, Floating Dock, Moving Border, Sparkles, Text Generate Effect, Timeline, Card Spotlight, Animated Testimonials, Apple Cards Carousel, Infinite Moving Cards. Copy-paste from docs.
- **Tool-UI** (https://www.tool-ui.com): Data Table (expandable), Chart, Stats Display, Approval Card, Progress Tracker, Code Block, Link Preview. Install: `npx assistant-ui add tool-ui <name>`
- **AI SDK Elements** (https://elements.ai-sdk.dev): Attachments, Conversation, Message, Prompt Input, Code Block, File Tree, Terminal, Canvas, Workflow components. Install: `npx ai-elements@latest add <name>`

## External Dependencies
- **React**: Frontend library.
- **TypeScript**: Superset of JavaScript for type safety.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn UI**: UI component library.
- **Wouter**: React routing library.
- **motion/react (Framer Motion)**: Animation library.
- **Express.js**: Backend web framework.
- **Google Fonts**: Plus Jakarta Sans (unified font for all UI text).
- **Image Format**: All 3D icons and illustrations use WebP format (compressed from 1024×1024 PNGs). Icons: 128×128 WebP (~3KB). Illustrations: 256×256 WebP (~5KB).
- **DiceBear**: For generating Micah (people) and Glass (entities) avatars.
- **lucide-react**: Icon library.
- **Zod**: Schema declaration and validation library.