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
        <p className="text-gold tracking-[0.3em] uppercase text-xs font-medium mb-3">
          {subtitle}
        </p>
      )}
      <h2
        className={`font-serif text-4xl md:text-5xl leading-tight mb-4 ${
          light ? 'text-cream' : 'text-charcoal'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-lg leading-relaxed ${
            light ? 'text-stone-300' : 'text-stone-500'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  )
}

export default SectionTitle
