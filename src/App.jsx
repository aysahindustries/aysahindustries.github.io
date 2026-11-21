import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './context'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Team from './pages/Team'
import Products from './pages/Products'
import Contact from './pages/Contact'
import { Login, Register } from './pages/Auth'
import Account from './pages/Account'
import Admin from './admin/Admin'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Shell({ children, bare }) {
  return (
    <>
      <Header bare={bare} />
      <main>{children}</main>
      {!bare && <Footer />}
    </>
  )
}

export default function App() {
  const { user, isAdmin, ready } = useApp()
  if (!ready) return <div className="boot"><div className="spinner" /></div>
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Shell><Home /></Shell>} />
        <Route path="/about" element={<Shell><About /></Shell>} />
        <Route path="/team" element={<Shell><Team /></Shell>} />
        <Route path="/products" element={<Shell><Products /></Shell>} />
        <Route path="/contact" element={<Shell><Contact /></Shell>} />
        <Route path="/login" element={<Shell bare><Login /></Shell>} />
        <Route path="/register" element={<Shell bare><Register /></Shell>} />
        <Route path="/account" element={user ? <Shell><Account /></Shell> : <Navigate to="/login" />} />
        <Route path="/admin/*" element={isAdmin ? <Admin /> : <Navigate to={user ? '/account' : '/login'} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
