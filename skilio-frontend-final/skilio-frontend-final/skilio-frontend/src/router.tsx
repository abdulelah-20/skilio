import { createBrowserRouter, Navigate } from 'react-router-dom'

import { ProtectedRoute }  from '@/components/ProtectedRoute'
import { PublicRoute }     from '@/components/PublicRoute'
import { AdminRoute }      from '@/components/AdminRoute'
import { AppShell }        from '@/components/layout/AppShell'
import { KidsRoute }       from '@/components/kids/KidsRoute'
import { KidsShell }       from '@/components/kids/KidsShell'

// Auth pages
import { LoginPage }    from '@/pages/auth/Login'
import { RegisterPage } from '@/pages/auth/Register'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import { ResetPasswordPage } from '@/pages/auth/ResetPassword'
import { LandingPage } from '@/pages/Landing'

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboard'

// Parent portal pages
import { DashboardPage }       from '@/pages/parent/Dashboard'
import { ManageChildrenPage }  from '@/pages/parent/ManageChildren'
import { ChildDetailPage }     from '@/pages/parent/ChildDetail'

// Learning space pages (parent view)
import { ModuleBrowserPage }  from '@/pages/learn/ModuleBrowser'
import { LessonListPage }     from '@/pages/learn/LessonList'
import { ScenarioPlayerPage } from '@/pages/learn/ScenarioPlayer'

// Kids Mode pages
import { KidsIndex }            from '@/pages/kids/KidsIndex'
import { CharacterBuilderPage } from '@/pages/kids/CharacterBuilderPage'
import { WorldSelectionPage }   from '@/pages/kids/WorldSelectionPage'
import { WorldMissionsPage }    from '@/pages/kids/WorldMissionsPage'
import { KidsMissionPlayerPage } from '@/pages/kids/KidsMissionPlayerPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },

  // ── Public routes (redirect to appropriate home if already logged in) ────────
  {
    element: <PublicRoute />,
    children: [
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // ── Admin Portal (requires is_admin = true) ──────────────────────────────────
  {
    element: <AdminRoute />,
    children: [
      { path: '/admin', element: <AdminDashboardPage /> },
    ],
  },

  // ── Parent Portal (requires auth, shows sidebar + parent layout) ────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/children',  element: <ManageChildrenPage /> },
          { path: '/children/:childId', element: <ChildDetailPage /> },
          { path: '/learn',             element: <ModuleBrowserPage /> },
          { path: '/learn/:moduleId',   element: <LessonListPage /> },
          { path: '/learn/:moduleId/:lessonId/play', element: <ScenarioPlayerPage /> },
        ],
      },
    ],
  },

  // ── Kids Mode (requires auth + selectedChild in kidsStore) ─────────────────
  {
    element: <KidsRoute />,
    children: [
      {
        element: <KidsShell />,
        children: [
          { path: '/kids',                            element: <KidsIndex /> },
          { path: '/kids/hero-builder',               element: <CharacterBuilderPage /> },
          { path: '/kids/worlds',                     element: <WorldSelectionPage /> },
          { path: '/kids/worlds/:moduleId',           element: <WorldMissionsPage /> },
          { path: '/kids/play/:moduleId/:lessonId',   element: <KidsMissionPlayerPage /> },
        ],
      },
    ],
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
