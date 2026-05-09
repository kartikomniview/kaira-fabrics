import { useEffect } from 'react'
import VisualizerOptions from './aivisualizer/VisualizerOptions'

const AIVisualizerPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
       <VisualizerOptions />
  )
}

export default AIVisualizerPage
