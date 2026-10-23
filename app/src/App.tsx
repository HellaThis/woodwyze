import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Workspace from './components/Workspace'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Suppliers from './pages/Suppliers'
import Survey from './pages/Survey'
import Admin from './pages/Admin'
import Settings from './pages/Settings'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="display text-3xl text-forest">That page isn't here</h1>
      <p className="mt-2 text-graphite/70">Use the menu above to get back to quoting or planning.</p>
    </div>
  )
}

// Hash routing keeps the demo working as a single file on any host.
export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quote" element={<WorkspaceKeyed mode="shop" />} />
          <Route path="plan" element={<WorkspaceKeyed mode="home" />} />
          <Route path="shop" element={<Shop />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="survey" element={<Survey />} />
          <Route path="admin" element={<Admin />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

/** Remount the workspace when its query changes, so opening a saved quote loads it. */
function WorkspaceKeyed({ mode }: { mode: 'shop' | 'home' }) {
  const { search } = useLocation()
  return <Workspace key={search} mode={mode} />
}
