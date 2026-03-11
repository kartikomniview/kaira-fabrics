/**
 * CardSkeleton — shimmer placeholder that mirrors CollectionCard / MaterialCard geometry.
 *
 * Usage:
 *   // 3 collection card skeletons in a grid:
 *   {loading && (
 *     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
 *       <CardSkeleton variant="collection" count={3} />
 *     </div>
 *   )}
 *
 *   // 4 material card skeletons:
 *   <CardSkeleton variant="material" count={4} />
 */

interface CardSkeletonProps {
  variant?: 'collection' | 'material'
  count?: number
  className?: string
}

/** Single shimmer block */
const Bone = ({ className = '', delay = 0 }: { className?: string; delay?: number }) => (
  <div
    className={`relative overflow-hidden bg-stone-200 ${className}`}
    aria-hidden="true"
  >
    <div
      className="absolute inset-0 -translate-x-full"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.72) 50%, transparent 100%)',
        animation: `kaira-shimmer 1.8s ease-in-out ${delay}s infinite`,
      }}
    />
  </div>
)

const CollectionSkeleton = ({ delay }: { delay: number }) => (
  <div className="bg-white overflow-hidden border border-stone-200" aria-hidden="true">
    {/* Image */}
    <Bone className="aspect-[4/3] w-full" delay={delay} />
    {/* Body */}
    <div className="p-6 border border-t-0 border-stone-200 space-y-3">
      <Bone className="h-2.5 w-20 rounded-sm" delay={delay} />
      <Bone className="h-5 w-3/4 rounded-sm" delay={delay} />
      <Bone className="h-3 w-full rounded-sm" delay={delay} />
      <Bone className="h-3 w-5/6 rounded-sm" delay={delay} />
      <div className="flex items-center justify-between pt-2">
        <Bone className="h-2.5 w-16 rounded-sm" delay={delay} />
        <Bone className="h-2.5 w-14 rounded-sm" delay={delay} />
      </div>
    </div>
  </div>
)

const MaterialSkeleton = ({ delay }: { delay: number }) => (
  <div className="bg-white overflow-hidden border border-stone-200" aria-hidden="true">
    {/* Image */}
    <Bone className="aspect-[5/4] w-full" delay={delay} />
    {/* Body */}
    <div className="p-6 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Bone className="h-2.5 w-20 rounded-sm" delay={delay} />
          <Bone className="h-5 w-3/4 rounded-sm" delay={delay} />
        </div>
        <Bone className="h-6 w-16 ml-3 shrink-0 rounded-sm" delay={delay} />
      </div>
      <Bone className="h-3 w-full rounded-sm" delay={delay} />
      <Bone className="h-3 w-full rounded-sm" delay={delay} />
      <Bone className="h-3 w-2/3 rounded-sm" delay={delay} />
      {/* Tags */}
      <div className="flex gap-2 pt-1">
        <Bone className="h-6 w-16 rounded-sm" delay={delay} />
        <Bone className="h-6 w-14 rounded-sm" delay={delay} />
        <Bone className="h-6 w-20 rounded-sm" delay={delay} />
      </div>
      <Bone className="h-2.5 w-full mt-3 rounded-sm" delay={delay} />
    </div>
  </div>
)

const CardSkeleton = ({ variant = 'collection', count = 3, className = '' }: CardSkeletonProps) => {
  const Card = variant === 'collection' ? CollectionSkeleton : MaterialSkeleton
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={className}>
          <Card delay={i * 0.12} />
        </div>
      ))}
    </>
  )
}

export default CardSkeleton
