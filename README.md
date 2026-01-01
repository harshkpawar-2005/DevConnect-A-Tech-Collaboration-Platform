# 🚀 DevConnect

**DevConnect** is a collaborative platform where developers can **post
projects**, **find teammates**, and **apply to real-world tech
projects**.\
It's designed to help students, freelancers, and builders connect based
on **skills, interests, and availability**.

------------------------------------------------------------------------

## 🌐 Live Concept

A single place to: - Post your project idea - Find collaborators - Apply
to projects - Manage applications - Build a public developer profile

------------------------------------------------------------------------

## ✨ Features

### 👤 Authentication

-   Secure authentication using **Clerk**
-   Sign up / Sign in with modal support
-   User profiles auto-created on first login

### 📌 Projects

-   Create and manage projects
-   Define roles, responsibilities, and requirements
-   Set last date to apply
-   Automatic **Open / Closed** status handling
-   Project deletion removes:
    -   Applications
    -   Wishlist references
    -   Project itself

### 📨 Applications

-   Apply once per project (duplicate prevention)
-   Real-time application tracking
-   Application status:
    -   Pending
    -   Interviewing
    -   Accepted
    -   Rejected
-   Disclaimer shown when accepted

### ❤️ Wishlist

-   Save / unsave projects
-   Synced across sessions

### 👤 Profiles

-   Skills management
-   External links (GitHub, LinkedIn, Portfolio, etc.)
-   Platform detection with icons/emojis
-   Public profile view

### ⚡ UI & UX

-   Responsive layout
-   Consistent card-based UI
-   Fixed-size project cards
-   Gradient theme with clean typography
-   Smooth transitions

------------------------------------------------------------------------

## 🛠 Tech Stack

### Frontend

-   React (Vite)
-   Tailwind CSS
-   ShadCN UI
-   Lucide Icons

### Backend / Services

-   Firebase Firestore
-   Firebase Security Rules
-   Clerk Authentication

------------------------------------------------------------------------

## 📂 Project Structure

    src/
     ├── components/
     ├── firebase/
     ├── pages/
     ├── utils/

------------------------------------------------------------------------

## 🚀 Getting Started

``` bash
npm install
npm run dev
```

------------------------------------------------------------------------

## 📬 Contact

📧 contact@devconnect.com

------------------------------------------------------------------------

## ⭐ Why This Project Matters

DevConnect demonstrates real-world full-stack architecture, clean UI/UX,
and scalable data modeling.
