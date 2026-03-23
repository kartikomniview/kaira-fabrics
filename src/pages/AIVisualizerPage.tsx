import { useEffect } from 'react'
import AIVisualizerDesktop from './aivisualizer/AIVisualizerDesktop'

const AIVisualizerPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
       <AIVisualizerDesktop />
  )
}

export default AIVisualizerPage
