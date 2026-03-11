interface SectionTitleProps {
  subtitle?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
  className?: string
}

const SectionTitle = ({
  subtitle,
  title,
  description,
  align = 'center',
  light = false,
  className = '',
}: SectionTitleProps) => {
  return (
    <div
      className={`${align === 'center' ? 'text-center mx-auto' : 'text-left'} max-w-2xl ${className}`}
    >
      {subtitle && (
        <div className={`flex items-center gap-3 mb-3 ${align === 'center' ? 'justify-center' : ''}`}>
          <div className="w-6 h-px bg-gold shrink-0" />
          <p className="text-xs tracking-[0.25em] uppercase font-medium text-stone-400">
            {subtitle}
          </p>
        </div>
      )}
      <h2
        className={`font-serif text-3xl md:text-4xl leading-tight mb-3 ${
          light ? 'text-white' : 'text-stone-900'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-base leading-relaxed ${
            light ? 'text-stone-400' : 'text-stone-500'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  )
}

export default SectionTitle
