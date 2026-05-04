import clsx from 'clsx'
import { motion } from 'framer-motion'

export function Container({ className, children }) {
  return <div className={clsx('mx-auto w-full max-w-5xl px-4', className)}>{children}</div>
}

export function Card({ className, children }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[var(--fp-shadow)] backdrop-blur supports-[backdrop-filter]:bg-white/70',
        'transition hover:-translate-y-[1px] hover:shadow-[0_14px_40px_rgba(2,6,23,0.10)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function MotionCard({ className, children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={clsx(
        'rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[var(--fp-shadow)] backdrop-blur supports-[backdrop-filter]:bg-white/70',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function Button({ className, variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition will-change-transform disabled:pointer-events-none disabled:opacity-60'
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-600 hover:to-indigo-800 hover:-translate-y-[1px] active:translate-y-0'
      : variant === 'secondary'
        ? 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 hover:-translate-y-[1px] active:translate-y-0'
        : 'bg-transparent text-indigo-700 hover:bg-indigo-50'
  return (
    <button
      className={clsx(base, styles, 'focus-visible:fp-focus active:scale-[0.99]', className)}
      {...props}
    />
  )
}

export function Input({ className, label, error, ...props }) {
  return (
    <label className={clsx('block', className)}>
      {label ? <div className="mb-1 text-sm font-medium text-slate-700">{label}</div> : null}
      <input
        className={clsx(
          'w-full rounded-xl border bg-white/90 px-3 py-2 text-sm outline-none transition',
          'placeholder:text-slate-400',
          error ? 'border-red-400 ring-red-200/60 focus:ring-4' : 'border-slate-200/80 focus-visible:fp-focus',
        )}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </label>
  )
}

export function Select({ className, label, error, children, ...props }) {
  return (
    <label className={clsx('block', className)}>
      {label ? <div className="mb-1 text-sm font-medium text-slate-700">{label}</div> : null}
      <select
        className={clsx(
          'w-full rounded-xl border bg-white/90 px-3 py-2 text-sm outline-none transition',
          error ? 'border-red-400 ring-red-200/60 focus:ring-4' : 'border-slate-200/80 focus-visible:fp-focus',
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </label>
  )
}

export function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl bg-gradient-to-r from-slate-100 via-slate-200/60 to-slate-100',
        className,
      )}
    />
  )
}

