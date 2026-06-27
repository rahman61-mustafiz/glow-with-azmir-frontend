import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import PasscodeGate from './components/PasscodeGate.jsx'
import Home from './pages/Home.jsx'
import Accounting from './pages/Accounting.jsx'
import Gallery from './pages/Gallery.jsx'
import ProductPrice from './pages/ProductPrice.jsx'
import AdvertisePanel from './pages/AdvertisePanel.jsx'
import SalesEntry from './pages/SalesEntry.jsx'

// The admin panel (passcode-gated). Nested routes are relative to /admin.
function AdminApp() {
  return (
    <Layout>
      <Routes>
        <Route path="" element={<Accounting />} />
        <Route path="accounting" element={<Accounting />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="products" element={<ProductPrice />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="advertise" element={<AdvertisePanel />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Staff / tablet — OPEN, standalone, no accounting, no admin links */}
      <Route path="/sales" element={<SalesEntry />} />

      {/* Admin — passcode required (re-prompts on every refresh) */}
      <Route
        path="/admin/*"
        element={
          <PasscodeGate>
            <AdminApp />
          </PasscodeGate>
        }
      />

      {/* Defaults route into the admin area (which is passcode-gated) */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
