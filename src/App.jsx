import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Account from './pages/Account.jsx'
import Gallery from './pages/Gallery.jsx'
import ProductPrice from './pages/ProductPrice.jsx'
import AdvertisePanel from './pages/AdvertisePanel.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/product-price" element={<ProductPrice />} />
        <Route path="/advertise" element={<AdvertisePanel />} />
      </Routes>
    </Layout>
  )
}
