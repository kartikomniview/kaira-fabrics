/**
 * SectionLoader — component/section level loader.
 *
 * Default (inline):
 *   <SectionLoader />
 *   <SectionLoader label="Fetching materials" size="lg" />
 *
 * Overlay (parent must be position:relative):
 *   <div className="relative">
 *     <ExpensiveContent />
 *     {loading && <SectionLoader overlay />}
 *   </div>
 */

interface SectionLoaderProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  /** Renders as an absolute inset overlay over its nearest positioned parent */
  overlay?: boolean
  className?: string
}

const outerSize = { sm: 32,  md: 48,  lg: 64  }
const innerSize = { sm: 18,  md: 26,  lg: 36  }
const textSize  = { sm: 9,   md: 10,  lg: 12  }

const SectionLoader = ({
  label,
  size = 'md',
  overlay = false,
  className = '',
}: SectionLoaderProps) => {
  const os = outerSize[size]
  const is = innerSize[size]
  const ts = textSize[size]

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      {/* Dual-ring */}
      <div className="relative flex items-center justify-center" style={{ width: os, height: os }}>
        {/* Outer ring — spins clockwise */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid rgba(162,239,15,0.12)',
            borderTopColor: '#A2EF0F',
            animation: 'kaira-spin-cw 1s linear infinite',
          }}
        />
        {/* Inner ring — spins counter-clockwise */}
        <div
          className="rounded-full"
          style={{
            width: is,
            height: is,
            border: '2px solid rgba(116,98,60,0.15)',
            borderBottomColor: '#74623C',
            animation: 'kaira-spin-ccw 0.7s linear infinite',
          }}
        />
      </div>

      {label && (
        <p
          className="select-none tracking-widest uppercase"
          style={{
            fontSize: ts,
            color: '#74623C',
            opacity: 0.55,
            fontFamily: 'var(--font-secondary)',
          }}
        >
          {label}
        </p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center ${className}`}
        style={{ backgroundColor: 'rgba(250,248,245,0.82)', backdropFilter: 'blur(2px)' }}
        role="status"
        aria-label={label ?? 'Loading'}
      >
        {spinner}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center py-20 ${className}`}
      role="status"
      aria-label={label ?? 'Loading'}
    >
      {spinner}
    </div>
  )
}

export default SectionLoader
