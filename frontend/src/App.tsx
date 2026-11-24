import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { CoursesPage, CourseDetailPage } from './pages/CoursesAndDetailPages'
import { CoursePlayerPage } from './pages/CoursePlayerPage'
import { AuthPage, StudentDashboardPage } from './pages/AuthAndDashboardPages'
import {
  CheckoutPage,
  DigitalStorePage,
  VerifyCertificatePage,
  LeaderboardPage,
  BlogPage,
} from './pages/CheckoutAndStorePages'
import { TrainerStudioPage, AdminConsolePage } from './pages/TrainerAndAdminPages'
import { JobPlacementPage } from './pages/JobPlacementPage'
import { CodeLabPage } from './pages/CodeLabPage'
import { SEOHead } from './components/common/SEOHead'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SEOHead />
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/learn/:courseId" element={<CoursePlayerPage />} />
          <Route path="/jobs" element={<JobPlacementPage />} />
          <Route path="/codelab" element={<CodeLabPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/store" element={<DigitalStorePage />} />
          <Route path="/verify-certificate" element={<VerifyCertificatePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/trainer" element={<TrainerStudioPage />} />
          <Route path="/admin" element={<AdminConsolePage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
