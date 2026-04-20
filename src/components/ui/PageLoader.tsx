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
    {/* Soft fabric weave texture */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 0.06,
        backgroundImage:
          'repeating-linear-gradient(45deg, #c8a96e 0, #c8a96e 1px, transparent 1px, transparent 12px),' +
          'repeating-linear-gradient(-45deg, #c8a96e 0, #c8a96e 1px, transparent 1px, transparent 12px)',
      }}
    />

    {/* Warm radial glow from centre */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse 55% 45% at 50% 52%, rgba(180,130,60,0.10) 0%, transparent 70%)',
      }}
    />

    {/* Weave threads — bottom rising bars */}
    <div
      className="absolute bottom-0 left-0 right-0 flex justify-center items-end pointer-events-none overflow-hidden"
      style={{ height: '60%', gap: 7 }}
    >
      {Array.from({ length: THREAD_COUNT }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i % 4 === 0 ? 2 : 1,
            height: `${32 + (i % 7) * 9}%`,
            borderRadius: 4,
            background:
              i % 3 === 0
                ? 'linear-gradient(to top, #c8a46a, rgba(200,164,106,0.15))'
                : i % 3 === 1
                ? 'linear-gradient(to top, #74623C, rgba(116,98,60,0.12))'
                : 'linear-gradient(to top, #4a3c28, rgba(74,60,40,0.08))',
            animation: `kaira-weave-rise ${1.25 + (i % 5) * 0.18}s ease-in-out ${(i * 0.06).toFixed(2)}s infinite alternate`,
          }}
        />
      ))}
    </div>

    {/* Soft corner ornaments */}
    {(['top-7 left-7', 'top-7 right-7', 'bottom-7 left-7', 'bottom-7 right-7'] as const).map((pos) => (
      <div key={pos} className={`absolute pointer-events-none ${pos}`}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: '1px solid rgba(200,164,106,0.22)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 5,
            borderRadius: '50%',
            background: 'rgba(200,164,106,0.12)',
          }}
        />
      </div>
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
