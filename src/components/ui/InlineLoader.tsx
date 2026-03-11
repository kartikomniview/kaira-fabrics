/**
 * InlineLoader — three bouncing dots for tight inline spaces (buttons, table cells, etc.).
 *
 * Usage:
 *   <InlineLoader />                          // primary, small
 *   <InlineLoader color="white" size="xs" />  // white, extra-small
 *   <InlineLoader color="secondary" />        // brand secondary
 */

interface InlineLoaderProps {
  size?: 'xs' | 'sm'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

const colorMap = {
  primary:   '#A2EF0F',
  secondary: '#74623C',
  white:     '#ffffff',
}

const dotSize = { xs: 4, sm: 6 }

const InlineLoader = ({ size = 'sm', color = 'primary', className = '' }: InlineLoaderProps) => {
  const px = dotSize[size]
  const bg = colorMap[color]

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      role="status"
      aria-label="Loading"
    >
      {[0, 0.17, 0.34].map((delay, i) => (
        <span
          key={i}
          className="inline-block rounded-full"
          style={{
            width: px,
            height: px,
            backgroundColor: bg,
            animation: `kaira-bounce-dot 0.8s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </span>
  )
}

export default InlineLoader
