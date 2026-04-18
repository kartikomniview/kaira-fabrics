import { Link } from 'react-router-dom'
import InlineLoader from './InlineLoader'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  to?: string
  href?: string
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  /** Shows an inline loader and disables the button while true */
  loading?: boolean
}

const base = 'inline-flex items-center justify-center gap-2 font-medium tracking-widest uppercase transition-all duration-300 cursor-pointer rounded-none'

const variants = {
  primary:   'bg-gold text-charcoal hover:bg-gold-dark active:scale-95',
  secondary: 'bg-charcoal text-cream hover:bg-stone-800 active:scale-95',
  outline:   'border border-gold text-gold hover:bg-gold hover:text-charcoal active:scale-95',
  ghost:     'text-gold hover:text-gold-light underline underline-offset-4 decoration-gold/40 hover:decoration-gold',
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-7 py-3 text-sm',
  lg: 'px-10 py-4 text-sm',
}

// Dot color that contrasts with each button variant
const loaderColor: Record<NonNullable<ButtonProps['variant']>, 'primary' | 'secondary' | 'white'> = {
  primary:   'secondary',
  secondary: 'white',
  outline:   'primary',
  ghost:     'primary',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  to,
  href,
  className = '',
  type = 'button',
  disabled = false,
  loading = false,
}: ButtonProps) => {
  const isDisabled = disabled || loading
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`

  const content = (
    <>
      {loading && <InlineLoader size="xs" color={loaderColor[variant]} />}
      {children}
    </>
  )

  if (to) {
    return <Link to={to} className={classes}>{content}</Link>
  }

  if (href) {
    return <a href={href} className={classes} target="_blank" rel="noopener noreferrer">{content}</a>
  }

  return (
    <button type={type} onClick={onClick} disabled={isDisabled} className={classes}>
      {content}
    </button>
  )
}

export default Button
