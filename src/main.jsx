import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import AppWrapper from './AppWrapper.jsx';
import { Toaster } from "@/components/ui/toaster";

// 1. Get the key from your .env.local file
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 2. Use the simple ClerkProvider, without the navigate prop */}
      <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
    <AppWrapper>
      <App />
      <Toaster />
    </AppWrapper>
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>,
)