import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './lib/store'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import BillingPage from './pages/BillingPage'
import ChangeOrdersPage from './pages/ChangeOrdersPage'
import LienReleasesPage from './pages/LienReleasesPage'
import InsurancePage from './pages/InsurancePage'
import EstimatesPage from './pages/EstimatesPage'
import EstimateDetailPage from './pages/EstimateDetailPage'
import EstimatePreviewPage from './pages/EstimatePreviewPage'
import DropboxSettingsPage from './pages/DropboxSettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/projects/:id/billing" element={<BillingPage />} />
                <Route path="/projects/:id/change-orders" element={<ChangeOrdersPage />} />
                <Route path="/projects/:id/lien-releases" element={<LienReleasesPage />} />
                <Route path="/estimates" element={<EstimatesPage />} />
                <Route path="/estimates/new" element={<EstimateDetailPage />} />
                <Route path="/estimates/:id" element={<EstimateDetailPage />} />
                <Route path="/estimates/:id/preview" element={<EstimatePreviewPage />} />
                <Route path="/insurance" element={<InsurancePage />} />
                <Route path="/settings/dropbox" element={<DropboxSettingsPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
