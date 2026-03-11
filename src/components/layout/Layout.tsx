import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import SectionLoader from '../ui/SectionLoader'
import Header from './Header'
import Footer from './Footer'

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* SectionLoader shows when navigating to a lazy route for the first time.
            Header and Footer remain visible throughout. */}
        <Suspense fallback={<SectionLoader label="Loading" className="min-h-[60vh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
