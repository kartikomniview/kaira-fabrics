/// <reference types="react" />

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        alt?: string
        poster?: string
        'camera-controls'?: boolean | ''
        'auto-rotate'?: boolean | ''
        'shadow-intensity'?: string
        'environment-image'?: string
        exposure?: string
        ar?: boolean | ''
        'ar-modes'?: string
        style?: React.CSSProperties
      }
    }
  }
}
