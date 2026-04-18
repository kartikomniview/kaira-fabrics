/**
 * PageLoader — full-screen branded loader.
 *
 * Usage (App.tsx manages visibility):
 *   {showLoader && <PageLoader exiting={appReady} />}
 *
 * The `exiting` prop triggers a CSS fade-out. After ~550 ms unmount it from the DOM.
 */

const LOGO = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/assets/clientLogos/KairaFabrics.png'
const THREAD_COUNT = 22

interface PageLoaderProps {
  /** Set true to trigger the fade-out animation before unmounting */
  exiting?: boolean
}

const PageLoader = ({ exiting = false }: PageLoaderProps) => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
    style={{
      backgroundColor: '#0b0905',
      transition: 'opacity 0.5s ease',
      opacity: exiting ? 0 : 1,
      pointerEvents: exiting ? 'none' : 'auto',
    }}
    aria-label="Loading"
    role="status"
  >
    {/* Grid texture */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 0.055,
        backgroundImage:
          'repeating-linear-gradient(0deg,#97c41e 0,#97c41e 1px,transparent 1px,transparent 54px),' +
          'repeating-linear-gradient(90deg,#97c41e 0,#97c41e 1px,transparent 1px,transparent 54px)',
      }}
    />

    {/* Weave threads — bottom rising bars */}
    <div
      className="absolute bottom-0 left-0 right-0 flex justify-center items-end pointer-events-none overflow-hidden"
      style={{ height: '60%', gap: 10 }}
    >
      {Array.from({ length: THREAD_COUNT }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 1,
            height: `${38 + (i % 7) * 8}%`,
            background:
              i % 3 === 0 ? '#97c41e'
              : i % 3 === 1 ? '#74623C'
              : '#3d3020',
            animation: `kaira-weave-rise ${1.25 + (i % 5) * 0.18}s ease-in-out ${(i * 0.06).toFixed(2)}s infinite alternate`,
          }}
        />
      ))}
    </div>

    {/* Corner brackets */}
    {(['top-8 left-8 border-t border-l', 'top-8 right-8 border-t border-r',
       'bottom-8 left-8 border-b border-l', 'bottom-8 right-8 border-b border-r'] as const
    ).map((pos) => (
      <div
        key={pos}
        className={`absolute w-7 h-7 pointer-events-none ${pos}`}
        style={{ borderColor: 'rgba(162,239,15,0.25)' }}
      />
    ))}

    {/* Centre content */}
    <div
      className="relative z-10 flex flex-col items-center gap-5"
      style={{ animation: 'kaira-fade-scale-in 0.65s ease-out both' }}
    >
      <img
        src={LOGO}
        alt="Kaira Fabrics"
        className="h-14 w-auto object-contain"
      />

      <p
        className="select-none"
        style={{
          fontSize: 9,
          letterSpacing: '0.65em',
          textTransform: 'uppercase',
          color: '#97c41e',
          opacity: 0.6,
          fontFamily: 'var(--font-secondary)',
        }}
      >
        Weaving your experience
      </p>

      {/* Sweeping progress bar */}
      <div
        className="relative w-36 overflow-hidden"
        style={{ height: 1, background: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="absolute inset-y-0 w-2/5"
          style={{
            background: 'linear-gradient(90deg, transparent, #97c41e, transparent)',
            animation: 'kaira-progress-sweep 1.65s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  </div>
)

export default PageLoader
