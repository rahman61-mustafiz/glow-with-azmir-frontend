import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Accounting from './pages/Accounting.jsx'
import Gallery from './pages/Gallery.jsx'
import ProductPrice from './pages/ProductPrice.jsx'
import AdvertisePanel from './pages/AdvertisePanel.jsx'
import SalesEntry from './pages/SalesEntry.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accounting" element={<Accounting />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/product-price" element={<ProductPrice />} />
        <Route path="/advertise" element={<AdvertisePanel />} />
        <Route path="/sales" element={<SalesEntry />} />
      </Routes>
    </Layout>
  )
}
