import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CollectionsPage from './pages/CollectionsPage'
import MaterialsPage from './pages/MaterialsPage'
import GalleryPage from './pages/GalleryPage'
import ThreeDVisualizerPage from './pages/ThreeDVisualizerPage'
import AIVisualizerPage from './pages/AIVisualizerPage'
import ContactPage from './pages/ContactPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="3d-visualizer" element={<ThreeDVisualizerPage />} />
          <Route path="ai-visualizer" element={<AIVisualizerPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
