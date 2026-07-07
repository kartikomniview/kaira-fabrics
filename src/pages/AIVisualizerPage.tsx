import { useEffect } from 'react'
import VisualizerOptions from './aivisualizer/VisualizerOptions'
import Seo, { pageTitle } from '../components/seo/Seo'

const AIVisualizerPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Seo
        title={pageTitle('AI Visualizer')}
        description="Use KAIRA's AI Visualizer to preview fabrics and leathers on your own furniture photos before you buy."
      />
      <VisualizerOptions />
    </>
  )
}

export default AIVisualizerPage
